// <reference path="../typings/tsd.d.ts" />

import {OSDService} from '../rest/osd';
import {PoolService} from '../rest/pool';
import {UtilService} from '../rest/util';
import {VolumeService} from '../rest/volume';
import {ServerService} from '../rest/server';
import {ClusterService} from '../rest/clusters';
import {RequestService} from '../rest/request';
import {ClusterHelper} from './cluster-helpers';
import {RequestTrackingService} from '../requests/request-tracking-svc';
import * as ModalHelpers from '../modal/modal-helpers';

export class ClusterExpandController {
    private name: any;
    private cluster: any;
    private newHost: any;
    private clusterID: number;
    private hosts: Array<any>;
    private disks: Array<any>;
    private osds: Array<any>;
    private clusterHelper: ClusterHelper;
    
    static $inject: Array<string> = [
        '$q',
        '$log',
        '$scope',
        '$modal',
        '$timeout',
        '$location',
        '$routeParams',
        'OSDService',
        'UtilService',
        'ServerService',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private logService: ng.ILogService,
        private scopeService: ng.IScope,
        private modalService: any,
        private timeoutService: ng.ITimeoutService,
        private locationService: ng.ILocationService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private osdService: OSDService,
        private utilService: UtilService,
        private serverService: ServerService,
        private clusterService: ClusterService,
        private requestService: RequestService,
        private reqTrackingService: RequestTrackingService) {
        
        this.hosts = [];
        this.disks = [];
        this.osds = [];
        this.clusterID =  this.routeParamsSvc['id'];
        
        this.clusterService.get(this.clusterID).then((cluster)=>this.loadCluster(cluster));
        this.serverService.getDiscoveredHosts().then((hosts)=>this.loadDiscoveredHosts(hosts));
        this.serverService.getFreeHosts().then((freeHosts)=>this.loadFreeHosts(freeHosts));
    }

    public loadCluster (cluster: any) {
        this.cluster = cluster;
        this.name = cluster.cluster_name;
    }

    public loadDiscoveredHosts(freeHosts: any) {
        _.each(freeHosts, (freeHost: any) => {
            var host: any = {
                hostname: freeHost.node_name,
                ipaddress: freeHost.management_ip,
                state: "UNACCEPTED",
                selected: false
            };
            this.hosts.push(host);
            this.updateFingerPrint(host);
        });
    }

    public updateFingerPrint(host: any) {
        this.newHost = {};
        this.newHost.errorMessage = "";
        this.newHost.cautionMessage = "";
        this.updateFingerCallBack(host);
    }

    public updateFingerCallBack(host: any): any {
        this.utilService.getIpAddresses(host.hostname).then((ipaddresses) => {
            host.ipaddress = ipaddresses.length > 0 ? ipaddresses[0] : "N/A";
            this.newHost.errorMessage = "";
            this.newHost.cautionMessage = "";
            return this.utilService.getSshFingerprint(host.ipaddress);
        },
            () => {
                this.newHost.cautionMessage = "Error!.";
                this.newHost.errorMessage = "Could not resolve the hostname";
            },
            (fingerPrint) => {
                host.fingerprint = fingerPrint;
            });
    }

    public loadFreeHosts (freeHosts: any) {
        _.each(freeHosts, (freeHost: any) => {
            var host = {
                id: freeHost.node_id,
                hostname: freeHost.node_name,
                ipaddress: freeHost.management_ip,
                state: "ACCEPTED",
                selected: false
            };
            this.hosts.push(host);
            this.updateFingerPrint(host);
        });
    }

    public selectAllHosts() {
        _.each(this.hosts, (host) => {
            this.selectHost(host, true);
        });
    }

    public selectHost(host: any, selection: boolean) {
        if (host.state === "ACCEPTED") {
            host.selected = selection;
            if (host.selected) {
                this.serverService.getStorageDevicesFree(host.id, host.hostname).then((disks) => {
                    host.disks = disks;
                    this.countDisks();
                });
            }
            this.countDisks();
        }
    }

    public countDisks() {
        var disks: Array<any> = [];
        _.each(this.hosts, (host) => {
            if (host.selected) {
                Array.prototype.push.apply(disks, host.disks);
            }
        });
        this.disks = disks;
    }

    public addNewHost() {
        this.clusterHelper.addNewHost(this, this.serverService);
    }

    public postAddNewHost(host: any) {
        this.clusterHelper.acceptNewHost(this, host);
    }

    public acceptAllHosts() {
        _.each(this.hosts, (host) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }

    public acceptHost(host: any) {
        this.clusterHelper.acceptHost(this, host);
    }

    public postAcceptHost(host: any) {
        if (host.id) {
            this.selectHost(host, true);
        } else {
            this.serverService.getByHostname(host.hostname).then((hostFound) => {
                host.id = hostFound.node_id;
                this.selectHost(host, true);
            });
        }
    }
    
    public removeHost(host: any) {
        _.remove(this.hosts, (currentHost) => {
            return currentHost.hostname === host.hostname;
        });
    }

    public getDisks(): any {
        return this.disks;
    }

    public getDiskSize(): any {
        var size: number = 0;
        return _.reduce(this.disks, (size: any, disk: any) => {
            return disk.size + size;
        }, 0);
    }

    public isSubmitAvailable(): boolean {
        return true;
    }

    public cancel(): void {
        this.locationService.path('/clusters');
    }

    public submit() {
        var hostPromises: Array<any> = [];
        var selectedHosts: Array<any> = [];
        var hostDisks: Array<any> = [];

        _.each(this.hosts, (host: any) => {
            if (host.selected) {
                var nodeType: number = this.cluster.cluster_type === 1 ? 4 : 2;
                var localHost: any = {
                    cluster: this.clusterID,
                    node_name: host.hostname,
                    management_ip: host.ipaddress,
                    cluster_ip: host.ipaddress,
                    public_ip: host.ipaddress,
                    node_type: nodeType
                };
                selectedHosts.push(host);
                hostDisks.push(host.disks);
                hostPromises.push(this.serverService.add(localHost));
            }
        });

        this.submitCallBack(hostPromises, selectedHosts, hostDisks);
    }

    public submitCallBack(hostPromises: any, selectedHosts: any, hostDisks: any) {
        this.qService.all(hostPromises).then((tasks: any) => {
            var modal = ModalHelpers.SuccessfulRequest(this.modalService, {
                title: 'Expand Cluster Request is Submitted',
                container: '.usmClientApp'
            });
            modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                $hide();
                this.locationService.path('/clusters');
            });

            var index = 0;
            while (index < tasks.length) {
                if (tasks[index].status === 202) {
                    var host: any = selectedHosts[index];
                    var disks: any = hostDisks[index];
                    var result: any = tasks[index];
                    this.reqTrackingService.add(result.data, 'Adding host \'' + host.hostname + '\' to cluster');
                    this.clusterExpandCallBack(result, host, disks);
                    this.timeoutService(()=>this.clusterExpandCallBack(result, host, disks), 5000);
                }
                ++index;
            }
        });
    }

    public clusterExpandCallBack(result: any, host: any, disks: any) {
        this.logService.info('Cluster expand callback ' + result.data);
        this.requestService.get(result.data).then((request: any) => {
            if (request.status === 'FAILED' || request.status === 'FAILURE') {
                this.logService.info('Adding host \'' + host.hostname + '\' is failed');
            }
            else if (request.status === 'SUCCESS') {
                this.logService.info('Host \'' + host.hostname + '\' is added successfully');
                this.postAddHost(this.cluster, host, disks);
            }
            else {
                this.logService.info('Waiting for host \'' + host.hostname + '\' to be added');
                this.timeoutService(()=>this.clusterExpandCallBack(result, host, disks), 5000);
            }
        });
    }

    public postAddHost(cluster: any, host: any, disks: any) {
        this.logService.info("Post Add host");
        if (cluster.cluster_type === 2) {
            this.postAddCephHost(cluster, host, disks);
        }
    }

    public postAddCephHost(cluster: any, host: any, disks: any) {
        var osdList: Array<any> = [];
        _.each(disks, (disk: any) => {
            if (!disk.inuse) {
                var osd: any = {
                    node: disk.node,
                    storage_device: disk.storage_device_id
                };
                osdList.push(osd);
            }
        });

        if (osdList.length > 0) {
            var osds: any = {
                osds: osdList
            };
            this.logService.info(osdList.length + " OSDs needs to be added to " + cluster.cluster_name);
            this.postAddCephHostCallBack(osds, cluster);
        }
    }

    public postAddCephHostCallBack(osds: any, cluster: any) {
        this.osdService.create(osds).then((result: any) => {
            if (result.status === 202) {
                this.reqTrackingService.add(result.data, 'Adding OSDs to cluster \'' + cluster.cluster_name + '\'');
            } else {
                this.logService.error('Unexpected response from OSD.create', result);
            }
        });
    }
}
