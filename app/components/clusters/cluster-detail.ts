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
    private utilizations: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private objects: any;
    private monitors: any;
    private tabList: any;
    private tabIndex: any;
    private clusterUtilization: any;
    private systemUtilization: any;
    private mostUsedPools: any;
    private utilizationByProfile: any;
    private trendsCharts: any;
    private timeSlots: [{name:string, value:string}];
    private selectedTimeSlot: any;
    private timer: ng.IPromise<any>;
    private rbds = [];
    private paramsObject: any;

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
        this.systemUtilization = {cpu:{data:{},config:{}},memory:{data:{},config:{}}};
        this.mostUsedPools = [];
        this.clusterList = [];
        this.tabList = {
            Overview: 1,
            Hosts: 2,
            Pools: 3,
            RBDs: 4,
            OSDs: 5,
            Configuration: 6
        }
        this.tabIndex = this.tabList.Overview;
        this.paramsObject = locationService.search();
        if (this.paramsObject.tab !== undefined) {
            this.tabIndex = this.tabList[this.paramsObject.tab];
        }
        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.utilizationByProfile = {};
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = {};
        /* For handling error in console: "url or json or rows or columns is required."
        we should initialize 'data' key with :{xData:[],yData:[]}. */
        this.trendsCharts = {
            overall: {title:"",data:{xData:[],yData:[]},config:{}},
            cpu: {title:"",data:{xData:[],yData:[]},config:{}},
            memory: {title:"",data:{xData:[],yData:[]},config:{}},
            latency: {title:"",data:{xData:[],yData:[]},config:{}},
            throughput: {title:"",data:{xData:[],yData:[]},config:{}},
            iops: {title:"",data:{xData:[],yData:[]},config:{}}
        };
        this.utilizations = {};
        this.hosts = { criticalAlerts: 0, error: 0, total: 0, unaccepted: 0 };
        this.pgs = { total: 0, error: 0, warning: 0 };
        this.osds = { criticalAlerts: 0, down: 0, error: 0, nearfull: 0, total: 0 };
        this.objects = { total: 0, criticalAlerts: 0 };
        this.pools = { criticalAlerts: 0, down: 0, total: 0 };
        this.monitors = { criticalAlerts: 0, down: 0, total: 0 };
        this.timeSlots = [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 hours", value: "" }];
        this.selectedTimeSlot = this.timeSlots[0];
        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterList = clusters;
        });
        this.getOverallUtilization();
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.clusterService.getClusterSummary(this.id).then((summary) => this.loadClusterSummary(summary));
        this.timer = this.intervalSvc(() => this.refreshRBDs(), 5000);
        this.scopeService.$on('$destroy', () => {
            this.intervalSvc.cancel(this.timer);
        });
        this.refreshRBDs();
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.cluster.status = cluster.status;
        this.cluster.enabled = cluster.enabled;
    }

    public loadClusterSummary(summary) {
        this.utilizations = summary.utilizations;
        this.getClusterUtilization(summary.usage);
        this.getUtilizationByProfile(summary.storageprofileusage, summary.monitoringplugins);
        this.getMostUsedPools(summary.storageusage);
        this.objects.total = summary.objectcount.num_objects;
        this.objects.criticalAlerts = summary.objectcount.num_objects_degraded;
        this.pools = summary.storagecount
        this.osds = summary.slucount;
        this.hosts = summary.nodescount;
        /* Need to check whether "summary.providermonitoringdetails" is empty
        object or not . because might be sometime it can be empty object */
        if(summary.providermonitoringdetails.ceph) {
            this.monitors = summary.providermonitoringdetails.ceph.monitor;
            this.pgs = summary.providermonitoringdetails.ceph.pgnum;
        }
        /* In "changeTimeSlot" function calling cpu and memory utilization api
        and that need "this.utilizations" data . so first we have this data from
        api . than only will call this "changeTimeSlot" function. so that we will
        have accurate data */
        this.changeTimeSlot(this.selectedTimeSlot);
    }

    public getClusterUtilization(usage: any) {
        this.capacity = usage;
        this.clusterUtilization.data = usage
        this.clusterUtilization.config.chartId = "utilizationChart";
        this.clusterUtilization.config.thresholds = {'warning':'60','error':'90'};
        this.clusterUtilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.clusterUtilization.config.centerLabelFn = () => {
              return Math.round(usage.percentused) + "% Used";
        };
    }

    public getUtilizationByProfile(profiles: any, monitoringplugins: any) {
        this.utilizationByProfile.threshold = {};
        let storageUtilizationThreshold  = _.find(monitoringplugins, function(element: any) {
                return element.name === 'storage_utilization';
        })
        storageUtilizationThreshold.configs.forEach((config: any) => {
            this.utilizationByProfile.threshold[config.type] = config.value
        });
        this.utilizationByProfile.profiles = [];
        var othersProfile = { "used": 0, "total": 0};
        Object.keys(profiles).forEach((profile) => {
            var usedData = profiles[profile]["Utilization"];
            if(profile === 'general' || profile === 'sas' || profile === 'ssd') {
                this.utilizationByProfile.profiles.push({ "usage": usedData, "subtitle": profile });
            }else {
                othersProfile.used = othersProfile.used + profiles[profile]["Utilization"]["used"];
                othersProfile.total = othersProfile.total + profiles[profile]["Utilization"]["total"];
            }
        });
        if (othersProfile.total > 0) {
            this.utilizationByProfile.profiles.push({ "usage" : { "total": othersProfile.total, "used": othersProfile.used } , "subtitle" : "Others" });
        }
    }

    public getOverallUtilization() {
        this.clusterService.getClusterOverallUtilization(this.id).then((overall_utilization) => {
            this.setGraphData(overall_utilization,"overall","Overall","%");
        });
    }

    public getCpuUtilization(timeSlot: any) {
        this.clusterService.getClusterCpuUtilization(this.id,timeSlot.value).then((cpu_utilization) => {
            this.setGraphData(cpu_utilization,"cpu","Cpu utilization","");
            this.setGraphUtilization({"total":100,"used":this.utilizations.cpupercentageusage},'cpu');
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        this.clusterService.getClusterMemoryUtilization(this.id,timeSlot.value).then((memory_utilization) => {
            this.setGraphData(memory_utilization,"memory","Memory utilization","");
            this.setGraphUtilization({"total":100,"used":this.utilizations.memoryusage.percentused},'memory');
        });
    }

    public getIOPS(timeSlot: any) {
        this.clusterService.getIOPS(this.id,timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K");
        });
    }

    public getThroughput(timeSlot: any) {
        this.clusterService.getThroughput(this.id,timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Throughput","KB/s");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.clusterService.getNetworkLatency(this.id,timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Latency","ms");
        });
    }

    public setGraphUtilization(usage, value) {
        this.systemUtilization[value].data = usage
        this.systemUtilization[value].config.chartId = value;
        this.systemUtilization[value].config.thresholds = {'warning':'60','error':'90'};
        this.systemUtilization[value].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       Math.round((d[0].value * 100)/usage.total) + '% ' + d[0].name +
                     '</span>';
        };
        this.systemUtilization[value].config.centerLabelFn = () => {
              return Math.round(usage.used) + "% Used";
        };
    }


    public setGraphData(graphArray, value, graphTitle, graphUnits) {
        var times = [];
        var used = [];
        times.push("dates");
        used.push("used");
        var usageDataArray = graphArray[0].datapoints;
        for (var index in usageDataArray) {
          var subArray = usageDataArray[index];
          times.push(new Date(subArray[1]));
          used.push(Math.round(subArray[0]));
        }
        this.trendsCharts[value] = {
            title: graphTitle,
            data: {
                  dataAvailable: true,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  value,
                title        :  graphTitle,
                layout       : 'compact',
                valueType    : 'actual',
                units        :  graphUnits,
            }
        }
    }

    public changeTimeSlot(time: any) {
        this.selectedTimeSlot = time;
        this.getCpuUtilization(this.selectedTimeSlot);
        this.getMemoryUtilization(this.selectedTimeSlot);
        this.getIOPS(this.selectedTimeSlot);
        this.getThroughput(this.selectedTimeSlot);
        this.getNetworkLatency(this.selectedTimeSlot);
    }

    public getMostUsedPools(mostUsedPools) {
        _.each(mostUsedPools, (pool) => {
            this.mostUsedPools.push({"title":pool["name"],"data": {total: 100, used: pool["usage"]["percentused"]}});
        });
    }

    public setTab(newTab: number) {
        this.locationService.search({});
        this.tabIndex = newTab;
    }

    public isSet(tabNum: number) {
        return this.tabIndex === tabNum;
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
