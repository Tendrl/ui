// <reference path="../typings/tsd.d.ts" />

import {ClusterHelper} from './cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {StorageService} from '../rest/storage';
import {BlockDeviceService} from '../rest/blockdevice';
import {BlockDevice} from '../rest/blockdevice';
import {StorageSize} from '../shared/types/storage';
import * as ModalHelpers from '../modal/modal-helpers';
import {numeral} from '../base/libs';
import {RequestService} from '../rest/request';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class ClusterDetailController {
    private clusterHelpers: ClusterHelper;
    private clusterList: Array<any>;
    private cluster: any;
    private capacity: any;
    private id: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private objects: any;
    private monitors: any;
    private tabList: any;
    private tabIndex: any;
    private discoveredHostsLength: any;
    private clusterUtilization: any;
    private openStackPools: any;
    private mostUsedPools: any;
    private utilizationByType: any;
    private utilizationByProfile: any;
    private memoryUtilization: any;
    private timeSlots: [{name:string, value:string}];
    private selectedTimeSlot: any;
    private timer: ng.IPromise<any>;
    private rbds = [];

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$interval',
        '$log',
        '$routeParams',
        '$modal',
        'ClusterService',
        'ServerService',
        'StorageService',
        'BlockDeviceService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private locationService: ng.ILocationService,
        private intervalSvc: ng.IIntervalService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private modalSvc,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private storageService: StorageService,
        private blockDeviceSvc: BlockDeviceService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.clusterUtilization = { data: {}, config: {} };
        this.openStackPools = [];
        this.mostUsedPools = [];
        this.clusterList = [];
        this.tabList = {
            Overview: 1,
            Hosts: 2,
            Pools: 3,
            RBDs: 4,
            OSDs: 5,
            Storage_Profiles: 6,
            Configuration: 7
        }
        this.tabIndex = this.tabList.Overview;
        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.utilizationByType = {};
        this.utilizationByProfile = {};
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = {};
        this.memoryUtilization = { title: "", data: {}, config: {} };
        this.hosts = { total: 0, warning: 0, critical: 0 };
        this.pgs = { total: 0, warning: 0, critical: 0 };
        this.osds = { total: 0, warning: 0, critical: 0 };
        this.objects = { total: 0, warning: 0, critical: 0 };
        this.pools = { total: 0, warning: 0, critical: 0 };
        this.monitors = { total: 0, warning: 0, critical: 0 };
        this.timeSlots = [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 weeks", value: "" }];
        this.selectedTimeSlot = this.timeSlots[0];

        this.getUtilizationByType();
        this.getOpenStackPools();
        this.getMostUsedPools();
        this.serverService.getDiscoveredHosts().then((freeHosts) => {
            this.discoveredHostsLength = freeHosts.length;
        });
        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterList = clusters;
        });
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
           this.osds.total = slus.length;
        });
        this.clusterService.getClusterObjects(this.id).then((clusterObjects: Array<any>) => {
           this.objects.total = clusterObjects[0].datapoints[0][1];
        });
        this.storageService.getListByCluster(this.id).then((storages: Array<any>) => {
           this.pools.total = storages.length;
        });
        this.getMemoryUtilization(this.selectedTimeSlot);
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.clusterService.getClusterUtilization(this.id).then((utilizations) => this.getClusterUtilization(utilizations));
        this.clusterService.getStorageProfileUtilization(this.id).then((utilizations) => this.getUtilizationByProfile(utilizations));
        this.serverService.getListByCluster(this.id).then((hosts) => this.getHostStatus(hosts));
        this.serverService.getList().then((nodes) => this.getMonitors(nodes));

        this.timer = this.intervalSvc(() => this.refreshRBDs(), 5000);
        this.scopeService.$on('$destroy', () => {
            this.intervalSvc.cancel(this.timer);
        });
        this.refreshRBDs();
    }

    public getMemoryUtilization(timeSlot: any) {
        this.clusterService.getClusterMemoryUtilization(this.id,timeSlot.value).then((memory_utilization) => {
            var times = [];
            var used = [];
            times.push("dates");
            used.push("used");
            var usageDataArray = memory_utilization[0].datapoints;
            for (var index in usageDataArray) {
              var subArray = usageDataArray[index];
              times.push(new Date(subArray[1]));
              used.push(Math.round(subArray[0]));
            }
            this.memoryUtilization = {
                title: "Memory utilization",
                data: {
                      dataAvailable: true,
                      total: 100,
                      xData: times,
                      yData: used
                },
                config: {
                    chartId      : 'memoryUtilization',
                    title        : 'Memory Utilization Trends',
                    layout       : 'inline',
                    valueType    : 'actual'
                }
            }
        });
    }

    public getUtilizationByType() {
        this.utilizationByType.title = 'Utilization by storage type';
        this.utilizationByType.data = {
          'total': '100',
          'subdata' : [ { "used" : 45 , "color" : "#00558a" , "subtitle" : "Object" },
                        { "used" : 15 , "color" : "#0071a6" , "subtitle" : "Block" },
                        { "used" :  5 , "color" : "#00a8e1" , "subtitle" : "OpenStack" }]
        };
        this.utilizationByType.layout = {
          'type': 'multidata'
        };
    }

    public getUtilizationByProfile(utilizations: Array<any>) {
        this.utilizationByProfile.title = 'Utilization by storage profile';
        this.utilizationByProfile.layout = {
          'type': 'multidata'
        };
        var subdata = [];
        _.each(utilizations, (utilization: any) => {
            var label = utilization.target.split('.');
            var usedData  = utilization.datapoints[0][0];
            if( label[3] === 'usage_percent' ) {
                if ( label[2] === 'storage_profile_utilization_general') {
                    subdata.push({ "used" : usedData , "color" : "#00558a" , "subtitle" : "General" });
                }
                else if (label[2] === 'storage_profile_utilization_sas') {
                    subdata.push({ "used" : usedData , "color" : "#0071a6" , "subtitle" : "SAS" });
                }else if (label[2] === 'storage_profile_utilization_ssd') {
                    subdata.push({ "used" : usedData , "color" : "#00a8e1" , "subtitle" : "SSD" });
                }
            }
        });
        this.utilizationByProfile.data = {
          'total': '100',
          'subdata' : subdata
        };
    }

    public getOpenStackPools() {
        this.openStackPools.push({"title":"Cinder","units":"GB","data":{"used":"25","total":"100"}});
        this.openStackPools.push({"title":"Cinder-Backup","units":"GB","data":{"used":"75","total":"100"}});
        this.openStackPools.push({"title":"Glance","units":"GB","data":{"used":"86","total":"100"}});
        this.openStackPools.push({"title":"Nova","units":"GB","data":{"used":"30","total":"100"}});
    }

    public getMostUsedPools() {
        this.mostUsedPools.push({"title":"Pool1","units":"GB","data":{"used":"85","total":"100"}});
        this.mostUsedPools.push({"title":"Pool2","units":"GB","data":{"used":"75","total":"100"}});
        this.mostUsedPools.push({"title":"Pool3","units":"GB","data":{"used":"95","total":"100"}});
        this.mostUsedPools.push({"title":"Pool4","units":"GB","data":{"used":"30","total":"100"}});
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.cluster.status = cluster.status;
        this.cluster.enabled = cluster.enabled;
    }

    public getClusterUtilization(utilizations: Array<any>) {
        _.each(utilizations, (utilization: any) => {
            var label = utilization.target.split('.')[3];
            var data  = utilization.datapoints[0][0];
            var dataFormated = numeral(data).format('0 b');
            if ( label === 'total_bytes') {
                this.capacity.total = dataFormated;
                this.clusterUtilization.data.total = data;
            }
            else if (label === 'used_bytes') {
                this.capacity.used = dataFormated;
                this.clusterUtilization.data.used = data;
            }
        });
        this.clusterUtilization.config.chartId = "utilizationChart";
        this.clusterUtilization.config.units = "GB";
        this.clusterUtilization.config.thresholds = {'warning':'60','error':'90'};
        this.clusterUtilization.config.legend = {"show":false};
        this.clusterUtilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.clusterUtilization.config.centerLabelFn = () => {
              return Math.round(100 * (this.clusterUtilization.data.used / this.clusterUtilization.data.total)) + "% Used";
        };
    }

    public getHostStatus(hosts: any) {
        this.hosts.total = hosts.length;
        var warning = 0, critical = 0;
        _.each(hosts, (host: any) => {
            if (host.node_status === 1) {
                critical++;
            }
        });
        this.hosts.critical = critical;
    }

    public getMonitors(nodes: any) {
        _.each(nodes, (node: any) => {
            if (node.clusterid === this.id && node.options1.mon === 'Y') {
                this.monitors.total++;
            }
        });
    }

    public setTab(newTab: number) {
        this.tabIndex = newTab;
    }

    public isSet(tabNum: number) {
        return this.tabIndex === tabNum;
    }

    public changeTimeSlot(time: any) {
        this.selectedTimeSlot = time;
        this.getMemoryUtilization(this.selectedTimeSlot);
    }

    public refreshRBDs() {
        this.blockDeviceSvc.getListByCluster(this.id).then(blockdevices => {
            this.loadRBDData(blockdevices);
        });
    }

    public loadRBDData(blockdevices: BlockDevice[]) {
        _.each(this.rbds, (blockdevice) => {
            blockdevice['updated'] = false;
        });
        _.each(blockdevices, (blockdevice: BlockDevice) => {
            var item = _.find(this.rbds, item => item.id === blockdevice.id);
            if (item) {
                item.size = blockdevice.size;
                item['updated'] = true;
            }
            else {
                blockdevice['updated'] = true;
                this.rbds.push(blockdevice);
            }
        });
        _.remove(this.rbds, blockdevice => !blockdevice['updated']);
    }

    public getFormatedSize(size: number): string {
        return numeral(size).format('0 b');
    }

    public createRBD() {
        this.locationService.path('/storage/new');
    }

    public showRBDResizeForm(rbd: BlockDevice) {
        rbd['resize'] = true;
        var sizeValue = rbd.size.substring(0, rbd.size.length - 2);
        var sizeUnit = rbd.size.substring(rbd.size.length - 2);
        var size = { value: parseInt(sizeValue), unit: sizeUnit };
        rbd['targetSize'] = size;
    }

    public updateRBDSize(rbd: BlockDevice, newSize: StorageSize) {
        rbd['targetSize'] = newSize;
    }

    public resizeRBD(rbd: BlockDevice) {
        var targetSize = rbd['targetSize'];
        var size = { size: targetSize.value + targetSize.unit };
        this.blockDeviceSvc.resize(rbd.clusterid, rbd.storageid, rbd.id, size).then((task) => {
            this.requestSvc.get(task.data.taskid).then((result) => {
                this.requestTrackingSvc.add(result.id, result.name);
            });
        });
        rbd['resize'] = false;
    }

    public cancelRBDResize(rbd: BlockDevice) {
        rbd['resize'] = false;
    }

    public removeRBD(rbd: BlockDevice) {
        var modal = ModalHelpers.RemoveConfirmation(this.modalSvc, {
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
            if (confirmed) {
                this.blockDeviceSvc.remove(rbd.clusterid, rbd.storageid, rbd.id).then((task) => {
                    this.requestSvc.get(task.data.taskid).then((result) => {
                        this.requestTrackingSvc.add(result.id, result.name);
                    });
                });
            }
            $hide();
        });
    }
}
