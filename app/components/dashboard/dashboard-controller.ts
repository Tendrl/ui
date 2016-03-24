import {ServerService} from '../rest/server';
import {ClusterService} from '../rest/clusters';
import {DashboardSummaryData} from '../rest/server';
import {UsageData} from '../rest/server';
import {numeral} from '../base/libs';

export class DashboardController {
    private clusters: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private objects: any;
    private monitors: any;
    private capacity: any;
    private utilization: any;
    private systemUtilization: any;
    private utilizationByProfile: any;
    private mostUsedPools: any;
    private trendsCharts: any;
    private timeSlots: [{name:string, value:string}];
    private selectedTimeSlot: any;
    private timer: ng.IPromise<any>;

    static $inject: Array<string> = [
        '$scope',
        '$location',
        '$log',
        '$interval',
        'ServerService',
        'ClusterService'
    ];

    constructor(private scopeService: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private intervalSvc: ng.IIntervalService,
        private serverService: ServerService,
        private clusterService: ClusterService) {

            this.utilization = { data: {}, config: {} };
            this.systemUtilization = {cpu:{data:{},config:{}},memory:{data:{},config:{}}};
            this.utilizationByProfile = {};
            this.mostUsedPools = [];
            this.capacity = {};
            this.clusters = { total: 0, error: 0 };
            this.hosts = { total: 0, error: 0, unaccepted: 0 };
            this.pgs = { total: 0, error: 0 };
            this.osds = { total: 0, error: 0 };
            this.objects = { total: 0, error: 0 };
            this.pools = { total: 0, down: 0 };
            this.monitors = { total: 0, error: 0 };
            this.trendsCharts = {
                cpu: {title:"",data:{},config:{}},
                memory: {title:"",data:{},config:{}},
                iops: {title:"",data:{},config:{}},
                throughput: {title:"",data:{},config:{}},
                latency: {title:"",data:{},config:{}}
            };
            this.timeSlots = [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 hours", value: "" }];
            this.selectedTimeSlot = this.timeSlots[0];
            // Summary data is returned as empty if there are no clusters in the system.
            // So here we are fetching the cluster list and redirect
            // if no clusters are present
            this.clusterService.getList().then((clusters) => {
                if (clusters.length === 0) {
                    this.$location.path('/first');
                }else {
                    this.timer = this.intervalSvc(() => this.loadDashboardData(), 10000);
                    this.scopeService.$on('$destroy', () => {
                        this.intervalSvc.cancel(this.timer);
                    });
                    this.loadDashboardData();
                }
            });
    }

    /**
     *This is the callback function called after getting summary data.
    */
    public loadDashboardData() {
        this.serverService.getDashboardSummary().then((summary) => {
            this.formatlUtilizationData(summary.usage);
            this.formatlUtilizationByProfileData(summary.storageprofileusage);
            this.getMostUsedPools(summary.storageusage);
            this.objects.total = summary.providermonitoringdetails.ceph.objects.num_objects;
            this.objects.error = summary.providermonitoringdetails.ceph.objects.num_objects_degraded;
            this.osds.total = summary.slucount.total;
            this.hosts = summary.nodescount;
            this.clusters = summary.clusterscount;
            this.pools = summary.storagecount;
            this.monitors.total = summary.providermonitoringdetails.ceph.monitor;
        });
        this.changeTimeSlot(this.selectedTimeSlot);
    }

    /**
     *This is the helper function for format the overall utilization data.
    */
    public formatlUtilizationData(usage: UsageData) {
        this.capacity = usage;
        this.utilization.data = usage
        this.utilization.config.chartId = "utilizationChart";
        this.utilization.config.thresholds = {'warning':'60','error':'90'};
        this.utilization.config.centerLabelFn = () => {
              return Math.round(usage.percentused) + "% Used";
        };
        this.utilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
    }

    /**
     *This is the helper function for format the utilization by profile data.
    */
    public formatlUtilizationByProfileData(profiles: any) {
        this.utilizationByProfile.title = 'Utilization by storage profile';
        this.utilizationByProfile.layout = {
          'type': 'multidata'
        };
        var subdata = [];
        var othersProfile: UsageData = { "used": 0, "total": 0};
        Object.keys(profiles).forEach((profile) => {
            var usedData = Math.round(profiles[profile]["percentused"]);
            if(profile === 'general') {
                subdata.push({ "used" : usedData , "color" : "#004368" , "subtitle" : "General" });
            }else if(profile === 'sas') {
                subdata.push({ "used" : usedData , "color" : "#00659c" , "subtitle" : "SAS" });
            }else if(profile === 'ssd') {
                subdata.push({ "used" : usedData , "color" : "#39a5dc" , "subtitle" : "SSD" });
            }else{
                othersProfile.used = othersProfile.used + profiles[profile]["used"];
                othersProfile.total = othersProfile.total + profiles[profile]["total"];
            }
        });
        var othersProfilePercent = Math.round(100 * (othersProfile.used / othersProfile.total));
        if (othersProfilePercent > 0) {
            subdata.push({ "used" : othersProfilePercent , "color" : "#7dc3e8" , "subtitle" : "Others" });
        }
        this.utilizationByProfile.data = {
          'total': '100',
          'subdata' : subdata
        };
    }

    public getMostUsedPools(storageUsage) {
        this.mostUsedPools = [];
        _.each(storageUsage, (pool) => {
            this.mostUsedPools.push({"title":pool["name"],"data":pool["usage"]});
        });
    }

    public getCpuUtilization(timeSlot: any) {
        this.serverService.getSystemCpuUtilization(timeSlot.value).then((cpu_utilization) => {
            this.drawGraphs(cpu_utilization,"cpu","Cpu utilization");
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        this.serverService.getSystemMemoryUtilization(timeSlot.value).then((memory_utilization) => {
            this.drawGraphs(memory_utilization,"memory","Memory utilization");
        });
    }

    public drawGraphs(graphArray, graphName, graphTitle) {
        this.setGraphData(graphArray,graphName,graphTitle,"%");
        /* sample response : "target": "collectd.system.cpu-user Current:1.01 Max:17.30 Min:0.20 ".
        formatting the currentState :- taking first value from  array , and splitting target's key string based on space and than at the last splitting this array based on ':'. now will have currentState in splitted array */
        var currentState = graphArray[0].target.split(" ")[1].split(":");
        if(currentState[0] === 'Current') {
            this.setGraphUtilization({"total":100,"used":parseInt(currentState[1])}, graphName);
        }
    }

    public getIOPS(timeSlot: any) {
        this.serverService.getIOPS(timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K");
        });
    }

    public getThroughput(timeSlot: any) {
        this.serverService.getThroughput(timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Throughput","KB/s");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.serverService.getNetworkLatency(timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Latency","ms");
        });
    }

    public setGraphUtilization(usage, graphName) {
        this.systemUtilization[graphName].data = usage
        this.systemUtilization[graphName].config.chartId = graphName;
        this.systemUtilization[graphName].config.thresholds = {'warning':'60','error':'90'};
        this.systemUtilization[graphName].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.systemUtilization[graphName].config.centerLabelFn = () => {
              return Math.round(usage.used) + "% Used";
        };
    }

    public setGraphData(graphArray, graphName, graphTitle, graphUnits) {
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
        this.trendsCharts[graphName] = {
            title: graphTitle,
            data: {
                  dataAvailable: true,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  graphName,
                title        :  graphTitle,
                layout       : 'compact',
                valueType    : 'actual',
                units        :  graphUnits,
                tooltipFn    :  function(d) {
                                    return  '<span class="donut-tooltip-pf">' +
                                              d[0].value + ' ' + graphUnits +
                                            '</span>';
                                }
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

}
