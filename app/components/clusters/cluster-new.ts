// <reference path="../typings/tsd.d.ts" />
// <reference path="./cluster-helpers.ts" />
// <reference path="../modal/modal-helpers.ts" />
// <reference path="../typings/node.d.ts"/>

import {Pool} from './cluster-modals';
import {Host} from './cluster-modals';
import {OSDService} from '../rest/osd';
import {Volume} from './cluster-modals';
import {Cluster} from './cluster-modals';
import {OpenstackService} from './cluster-modals';
import {PoolService} from '../rest/pool';
import {UtilService} from '../rest/util';
import {KeyValue} from './cluster-modals';
import {ServerService} from '../rest/server';
import {VolumeService} from '../rest/volume';
import {RequestService} from '../rest/request';
import {ClusterService} from '../rest/clusters';
import {ConfigService} from '../rest/config';
import {ClusterHelper} from './cluster-helpers';
import * as ModalHelpers from '../modal/modal-helpers';
import {VolumeHelpers} from '../volumes/volume-helpers';
import {RequestTrackingService} from '../requests/request-tracking-svc';
import {numeral} from '../base/libs';

export class ClusterNewController {
    private step: number;
    private minMonsRequired = 3;
    private errorMessage: string;
    private summaryHostsSortOrder: any;

    private clusterName: any;
    private clusterTypes: Array<Cluster>;
    private clusterType: Cluster;

    private openstack = false;
    private openstackServices: Array<OpenstackService>;

    private newHost: any;
    private hosts: Array<any>;
    private hostTypes: Array<string>;
    private disks: Array<any>;
    private osds: Array<any>;

    private availableNetworks: Array<any>;

    private volumes: Array<any>;
    private newVolume: any;
    private pools: Array<any>;
    private newPool: any;
    private clusterHelper: ClusterHelper;

    static $inject: Array<string> = [
        '$q',
        '$log',
        '$scope',
        '$modal',
        '$timeout',
        '$location',
        'VolumeService',
        'ClusterService',
        'ServerService',
        'OSDService',
        'PoolService',
        'UtilService',
        'RequestService',
        'RequestTrackingService',
        'ConfigService'
    ];
    /**
     * Initializing the properties of the class ClusterNewController.
     */
    constructor(private qService: ng.IQService,
        private logService: ng.ILogService,
        private scopeService: ng.IScope,
        private modalService: any,
        private timeoutService: ng.ITimeoutService,
        private locationService: ng.ILocationService,
        private volumeService: VolumeService,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private osdService: OSDService,
        private poolService: PoolService,
        private utilService: UtilService,
        private requestService: RequestService,
        private requestTrackingService: any,
        private configSvc: ConfigService) {

        this.step = 1;
        this.clusterHelper = new ClusterHelper(utilService, requestService, logService, timeoutService);
        this.newVolume = {};
        this.newPool = {};
        this.hosts = [];
        this.volumes = [];
        this.pools = [];
        this.disks = [];
        this.newHost = {};
        this.hostTypes = ["Monitor", "OSD Host", "OSD + Monitor"];
        this.availableNetworks = [];

        this.clusterTypes = this.clusterHelper.getClusterTypes();
        this.clusterType = this.clusterTypes[1];

        this.openstackServices = angular.copy(this.clusterHelper.getOpenStackServices());

        this.newVolume.copyCount = VolumeHelpers.getRecomendedCopyCount();
        this.newVolume.copyCountList = VolumeHelpers.getCopiesList();

        this.newVolume.sizeUnits = VolumeHelpers.getTargetSizeUnits();
        this.newVolume.sizeUnit = _.first(this.newVolume.sizeUnits);

        this.newPool.copyCountList = VolumeHelpers.getCopiesList();
        this.newPool.copyCount = VolumeHelpers.getRecomendedCopyCount();

        this.configSvc.getConfig().then((config) => {
            if (config.ceph_min_monitors) {
                this.minMonsRequired = config.ceph_min_monitors;
            }
        });
        this.fetchFreeHosts();
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
        this.availableNetworks = [];
        var subnets = new Set();
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
                return disk.Type === 'disk' && disk.Used == false;
            });
            this.hosts.push(host);
            this.updateFingerPrint(host);
            _.each(freeHost.network_info.Subnet, (network) => {
                subnets.add(network);
            });
        });
        subnets.forEach((network) => {
            this.availableNetworks.push({ address: network, cluster: false, access: false });
        });
        if (this.availableNetworks.length > 0) {
            this.availableNetworks[0].cluster = true;
            this.availableNetworks[0].access = true;
        }
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
                Array.prototype.push.apply(disks, this.getHostFreeDisks(host));
            }
        });
        this.disks = disks;
    }

    public getHostFreeDisks(host) {
        var freeDisks = _.filter(host.disks, (disk: any) => {
            return disk.Type === 'disk' && disk.Used == false;
        });
        return freeDisks;
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
            else if (this.isOsd(host.hostType) && this.getHostFreeDisks(host).length === 0) {
                this.errorMessage = "Host '" + host.hostname + "' does not have any disk attached and it can't be added as an OSD Host.";
                return false;
            }
        }

        this.errorMessage = "";
        return true;
    }

    public selectHost(host: any, selection: boolean) {
        host.selected = selection;
        if(selection && host.hostType === undefined) {
            if(this.getHostFreeDisks(host).length === 0){
                host.hostType = this.hostTypes[0];  //No Disk available so make this a Mon
            }else{
                host.hostType = this.hostTypes[1];  //There are some disks so it can be an OSD
            }
        }
        this.countDisks();
        this.validateHost(host);
    }

    public selectAllHosts() {
        _.each(this.hosts, (host) => {
            this.selectHost(host, true);
        });
    }

    public showDisks() {
        var template = 'views/clusters/storageprofile/storage-profile-disks.html';
        var myModal = this.modalService({ template: template, container: 'body', });
    }

    public sortHostsInSummary() {
        this.summaryHostsSortOrder = this.summaryHostsSortOrder === '-hostname' ? 'hostname' : '-hostname';
    }

    public addNewHost() {
        this.clusterHelper.addNewHost(this, this.serverService, this.timeoutService, this.requestService);
    }

    public postAddNewHost(host: any) {
        this.clusterHelper.acceptNewHost(this, host);
    }

    public acceptHost(host: any) {
        this.clusterHelper.acceptHost(this, host);
    }

    public acceptAllHosts() {
        _.each(this.hosts, (host) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }

    public postAcceptHostCallBack = (host: any) => {
        this.serverService.getByHostname(host.hostname).then((hostFound) => {
            host.id = hostFound.nodeid;
            this.selectHost(host, true);
        });
    }

    public postAcceptHost(host: any) {
        if (host.id) {
            this.selectHost(host, true);
        } else {
            this.postAcceptHostCallBack(host);
        }
    }

    public removeHost(host: any) {
        _.remove(this.hosts, (currentHost) => {
            return currentHost.hostname === host.hostname;
        });
    }

    public addNewVolume(newVolume: any) {
        var freeDisks: any = _.filter(this.disks, (disk: any) => {
            return !disk.used;
        });
        
        var devicesMap: any = _.groupBy(freeDisks, (disk: any) => {
            return disk.node;
        });

        var devicesList: any = _.map(devicesMap, (disks: any) => {
            return disks;
        });
        
        var selectedDisks = VolumeHelpers.getStorageDevicesForVolumeBasic(newVolume.size, newVolume.copyCount, devicesList);
        _.each(selectedDisks, (selectedDisk: any) => {
            selectedDisk.used = true;
        })
        
        newVolume.disks = selectedDisks;
        this.volumes.push(newVolume);
        this.newVolume = {};    
        this.newVolume = {
            copyCountList: VolumeHelpers.getCopiesList(),
            copyCount: VolumeHelpers.getRecomendedCopyCount(),
            sizeUnits: VolumeHelpers.getTargetSizeUnits(),
            sizeUnit: _.first(this.newVolume.sizeUnits)
        };
    }

    public addNewPool(newPool: Pool) {
        this.pools.push(newPool);
        this.newPool = {
            copyCountList: VolumeHelpers.getCopiesList(),
            copyCount: VolumeHelpers.getRecomendedCopyCount()
        };
    }

    public moveStep(nextStep: any) {
        this.errorMessage = "";
        var configValid = true;
        var monCount = 0;
        if(this.step ===1){
            configValid = this.clusterName !== undefined && this.clusterName.trim().length > 0;
        }
        else if(this.step === 2 && nextStep === 1){
            monCount = this.getMonCount();
            if(monCount < this.minMonsRequired){
                this.errorMessage = " Choose at least " + this.minMonsRequired + " monitors to continue";
                configValid = false;
            }
            else if(monCount%2 === 0){
                this.errorMessage = " Number of Monitors cannot be even";
                configValid = false;
            }
            else{
                configValid = _.every(this.hosts, host => this.validateHost(host));
            }
        }
        this.step = configValid ? this.step + nextStep : this.step;
    }

    public isCancelAvailable(): boolean {
        return this.step === 1;
    }

    public isSubmitAvailable(): boolean {
        return this.step === 5;
    }

    public cancel() {
        this.locationService.path('/clusters');
    }

    public glusterCallBack(requests: any, volumes: any) {
        this.qService.all(requests).then((results) => {
            var index = 0;
            while (index < results.length) {
                if (results[index].status === 202) {
                    this.requestTrackingService.add(results[index].data, 'Creating volume \'' + volumes[index].name);
                }
                ++index;
            }
        });
    }

    public postGlusterClusterCreate(cluster: any, volumes: any) {
        var requests: Array<any> = [];
        _.each(volumes, (volume: any) => {
            var localVolume: any = {
                cluster: cluster.cluster_id,
                volume_name: volume.name,
                volume_type: 2,
                replica_count: volume.copyCount,
                bricks: []
            };
            _.each(volume.disks, (device: any) => {
                var brick: any = {
                    node: device.node,
                    storage_device: device.storage_device_id
                };
                localVolume.bricks.push(brick);
            });
            console.log(localVolume);
            requests.push(this.volumeService.create(localVolume));
        });

        this.glusterCallBack(requests, volumes);
    }

    public createCephPoolsCallBack(cluster: any, poolsRequest: any) {
        this.poolService.create(poolsRequest).then((result) => {
            if (result.status === 202) {
                this.requestTrackingService.add(result.data, 'Creating pools in cluster \'' + cluster.cluster_name + '\'');
            } else {
                this.logService.error('Unexpected response from Pools.create', result);
            }
        });
    }

    public createCephPools(cluster: any, disks: any, pools: any) {
        this.logService.info('Post OSD Create');
        var poolsRequest = {
            cluster: cluster.cluster_id,
            pools: []
        };

        _.each(pools, (pool: any) => {
            poolsRequest.pools.push({
                pool_name: pool.name,
                pg_num: parseInt(pool.pgNum)
            });
            
            if (poolsRequest.pools.length > 0) {
                this.createCephPoolsCallBack(cluster, poolsRequest);
            }
        });
    }

    public addingOSDsCallBack(result: any, cluster: any, disks: any, pools: any) {
        this.logService.info('Adding OSDs callback ' + result.data);
        this.requestService.get(result.data).then((request) => {
            if (request.staus === 'FAILED' || request.status === 'FAILURE') {
                this.logService.info('Adding OSDs to cluster\'' + this.clusterName + '\'  is failed');
            } else if (request.status === 'SUCCESS') {
                this.logService.info('Adding OSDs to cluster \'' + this.clusterName + '\' is completed successfully');
                this.createCephPools(cluster, disks, pools);    
            } else {
                this.logService.info('Waiting for OSDs to be added to cluster \'' + this.clusterName + '\'');
                this.timeoutService(() => this.addingOSDsCallBack(result, cluster, disks, pools), 5000);
            }   
        });
    }

    public cephCallBack(osds: any, cluster: any, disks: any, pools: any) {
        this.osdService.create(osds).then((result: any) => {
            this.requestTrackingService.add(result.data, 'Adding OSDs to cluster \'' + cluster.cluster_name + '\'');
            this.addingOSDsCallBack(result, cluster, disks, pools);
            this.timeoutService(() => this.addingOSDsCallBack(result, cluster, disks, pools), 5000);
        });
    }

    public postCephClusterCreate(cluster: any, disks: any, pools: any) {
        var osdList: Array<any> = [];
        _.each(disks, (disk: any) => {
            var osd: any = {
                node: disk.node,
                storage_device: disk.storage_device_id
            };
            osdList.push(osd);
        });

        var osds: any = {
            osds: osdList
        };

        this.cephCallBack(osds, cluster, disks, pools);
    }

    public postClusterCreate(cluster: any, disks: any, volumes, pools) {
        this.logService.info('Post Cluster Create');
        if (this.clusterType.type === 'Gluster') {
            this.postGlusterClusterCreate(cluster, volumes);
        } else {
            this.postCephClusterCreate(cluster, disks, pools);
        }
    }

    public clusterCreateSuccessCallBack(cluster: any) {
        var disks = this.getDisks();
        var volumes = this.volumes;
        var pools = this.pools;

        this.clusterService.getByName(this.clusterName).then((result: any) => {
            cluster.cluster_id = result.cluster_id;
            this.postClusterCreate(cluster, disks, volumes, pools);
        });

    }

    public clusterCreateCallBack(result: any, cluster: any) {
        this.logService.info("Cluster Create CallBack" + result.data);
        this.requestService.get(result.data).then((request: any) => {
            if (request.status === 'FAILED' || request.status === 'FAILURE') {
                this.logService.info('Creating cluster \'' + this.clusterName + '\' is failed');
            } else if (request.status === 'SUCCESS') {
                this.logService.info('Cluster \'' + this.clusterName + '\' is created successfully');
                this.clusterCreateSuccessCallBack(cluster);
            } else {
                this.logService.info('Waiting for Cluster \'' + this.clusterName + '\' to be ready');
                this.timeoutService(() => this.clusterCreateCallBack(result, cluster), 5000);
            }
        })
    }

    public createCluster(cluster: any) {
        this.clusterService.create(cluster).then((result: any) => {
            if (result.status === 202) {
                this.requestService.get(result.data.taskid).then((task) => {
                    this.requestTrackingService.add(task.id, task.name);
                });
                var modal = ModalHelpers.SuccessfulRequest(this.modalService, {
                    title: 'Create Cluster Request is Submitted',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.locationService.path('/tasks/' + result.data.taskid);
                });
            }
            else {
                this.logService.error('Unexpected response from Clusters.create:', result);
            }
        });
    }

    public getOSDHosts() {
        return _.filter(this.hosts, host => host.selected && this.isOsd(host.hostType));
    }

    public getMonCount(){
            var count: number=0;
            _.each(this.hosts, (host: any) => {
            if (host.selected && this.isMon(host.hostType)) {
                count++;
            }
        });
        return count;
    }

    public submit() {
        var nodes: Array<any> = [];
        _.each(this.hosts, (host: any) => {
            if (host.selected) {
                var localHost: any = {
                    nodeid: host.id,
                    nodetype: []
                };
                var disks = [];
                if (this.isOsd(host.hostType)) {
                    localHost.nodetype.push('OSD');
                    localHost.disks = _.map(host.disks, (disk: any) => {
                        return { name: disk.DevName, fstype: 'xfs' };
                    });
                }
                if (this.isMon(host.hostType)) {
                    localHost.nodetype.push('MON');
                }
                nodes.push(localHost);
            }
        });
        var clusterNetwork: any = _.find(this.availableNetworks, (network) => {
            return network.cluster;
        });
        var accessNetwork: any = _.find(this.availableNetworks, (network) => {
            return network.access;
        });
        var networks = {
            cluster: clusterNetwork.address,
            public: accessNetwork.address
        };

        var cluster = {
            name: this.clusterName,
            type: this.clusterType.type,
            nodes: nodes,
            networks: networks
        };
        this.createCluster(cluster);
    }
}
