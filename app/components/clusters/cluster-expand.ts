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
import {numeral} from '../base/libs';

export class ClusterExpandController {
    private name: any;
    private clusterType: any;
    private cluster: any;
    private newHost: any;
    private clusterID: string;
    private hosts: Array<any>;
    private disks: Array<any>;
    private clusterHelper: ClusterHelper;
    private hostTypes: Array<string>;
    private errorMessage: string;
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
        private requestTrackingService: RequestTrackingService) {

        this.newHost = {};
        this.hosts = [];
        this.disks = [];
        this.clusterHelper = new ClusterHelper(utilService, requestService, logService, timeoutService);
        this.clusterID = this.routeParamsSvc['id'];
        this.hostTypes = ["Monitor", "OSD Host", "OSD + Monitor"];
        this.clusterService.get(this.clusterID).then((cluster)=>this.loadCluster(cluster));
        this.fetchFreeHosts();
    }

    public loadCluster (cluster: any) {
        this.cluster = cluster;
        this.name = cluster.name;
        this.clusterType = this.clusterHelper.getClusterType(cluster.cluster_type);
    }

    public updateFingerPrint(host: any) {
        this.newHost.cautionMessage = "";
        this.newHost.errorMessage = "";
        this.utilService.getSshFingerprint(host.hostname).then(
            (sshfingerprint: any) => {
                host.sshfingerprint = sshfingerprint;
            },
            () => {
                this.newHost.cautionMessage = "Error!.";
                this.newHost.errorMessage = "Could not fetch ssh fingerprint";
            });
    }

    public updateIPAddress(host: any) {
        this.utilService.getIpAddresses(host.hostname).then((result) => {
            host.ipaddress = result.length > 0 ? result[0] : "N/A";
        });
    }

    public fetchFreeHosts() {
        this.serverService.getFreeHosts().then((freeHosts) => this.loadFreeHosts(freeHosts));
    }

    public loadFreeHosts(freeHosts: any) {
        this.hosts = [];
        _.each(freeHosts, (freeHost: any) => {
            var host = {
                id: freeHost.nodeid,
                hostname: freeHost.hostname,
                ipaddress: freeHost.management_ip4,
                state: "ACCEPTED",
                disks: freeHost.storage_disks,
                selected: false,
            };
            host.disks = _.filter(freeHost.storage_disks, (disk: any) => {
                return disk.Type === 'disk' && disk.Used === false;
            });
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
        host.selected = selection;
        if(selection && host.hostType === undefined) {
            if(host.disks.length === 0){
                host.hostType = this.hostTypes[0];  //No Disk available so make this a Mon
            }else{
                host.hostType = this.hostTypes[1];  //There are some disks so it can be an OSD
            }
        }
        this.countDisks();
        this.validateHost(host);
    }

    public isMon(hostType: string): boolean {
        return hostType === this.hostTypes[0] || hostType === this.hostTypes[2];
    }

    public isOsd(hostType: string): boolean {
        return hostType === this.hostTypes[1] || hostType === this.hostTypes[2];
    }

    public getDisks(): any {
        return this.disks;
    }

    public getDisksSize(): any {
        var size: number = 0;
        size = _.reduce(this.disks, (size: any, disk: any) => {
            return size + disk.Size;
        }, 0);
        return numeral(size).format('0.0 b');
    }

    public countDisks() {
        var disks: Array<any> = [];
        _.each(this.hosts, (host) => {
            if (host.selected && this.isOsd(host.hostType)) {
                Array.prototype.push.apply(disks, host.disks);
            }
        });
        this.disks = disks;
    }

    public hostTypeChanged(host: any){
        this.validateHost(host);
        this.countDisks()
    }

    public validateHost(host: any): boolean {
        if (host.selected) {
            if (host.hostType === undefined) {
                this.errorMessage = "Host '" + host.hostname + "' does not have any role attached.";
                return false;
            }
            else if (this.isOsd(host.hostType) && host.disks.length === 0) {
                this.errorMessage = "Host '" + host.hostname + "' does not have any disk attached and it can't be added as an OSD Host.";
                return false;
            }
        }

        this.errorMessage = "";
        return true;
    }

    public validateHosts(): boolean {
        this.newHost.errorMessage = "";
        var configValid = true;
        var selectedHosts = _.filter(this.hosts, host => host.selected);
        if (selectedHosts.length === 0) {
            this.errorMessage = " Select atleast one Host to expand the Cluster";
            configValid = false;
        }
        else {
            configValid = _.every(selectedHosts, host => this.validateHost(host));
        }

        return configValid;
    }

    public addNewHost() {
        this.clusterHelper.addNewHost(this, this.serverService, this.timeoutService, this.requestService);
    }

    public postAddNewHost(host: any) {
        this.clusterHelper.acceptNewHost(this, host);
    }

    public isSubmitAvailable(): boolean {
        return true;
    }

    public cancel(): void {
        this.locationService.path('/clusters');
    }

    public submit() {
        if (this.validateHosts()) {
            var nodes: Array<any> = [];
            _.each(this.hosts, (host: any) => {
                if (host.selected) {
                    var localHost: any = {
                        nodeid: host.id,
                        nodetype: []
                    };
                    var disks = [];
                    if (this.isOsd(host.hostType)) {
                        localHost.disks = _.map(host.disks, (disk: any) => {
                            return { name: disk.DevName, fstype: 'xfs' };
                        });
                        localHost.nodetype.push('OSD');
                    }
                    if (this.isMon(host.hostType)) {
                        localHost.nodetype.push('MON');
                    }
                    nodes.push(localHost);
                }
            });
            this.expandCluster(this.clusterID, nodes);
        }
    }

    public expandCluster(clusterId: string, cluster) {
        this.clusterService.expand(clusterId, cluster).then((result) => {
            if (result.status === 202) {
                this.requestService.get(result.data.taskid).then((task) => {
                    this.requestTrackingService.add(task.id, task.name);
                });
                var modal = ModalHelpers.SuccessfulRequest(this.modalService, {
                    title: 'Expand Cluster Request is Submitted',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.locationService.path('/tasks/' + result.data.taskid);
                });
            }
            else {
                this.logService.error('Unexpected response from Clusters.expand:', result);
            }
        });
    }
}
