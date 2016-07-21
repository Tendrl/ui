import {ServerService} from '../rest/server';
import {ClusterService} from '../rest/clusters';
import {DashboardSummaryData} from '../rest/server';
import {UsageData} from '../rest/server';
import {numeral} from '../base/libs';

export class DashboardController {
    private summary: any;
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
    private isLoading: any;

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

            this.isLoading = { summaryData: true, utilizationData: true, trendsChartsData: true };
            this.utilization = { data: {}, config: {} };
            this.systemUtilization = {cpu:{data:{},config:{}},memory:{data:{},config:{}}};
            this.utilizationByProfile = {};
            this.mostUsedPools = [];
            this.capacity = {};
            this.clusters = { criticalAlerts: 0, error: 0, nearfull: 0, total: 0 };
            this.hosts = { criticalAlerts: 0, error: 0, total: 0, unaccepted: 0 };
            this.pgs = { total: 0, error: 0, warning: 0 };
            this.osds = { criticalAlerts: 0, down: 0, error: 0, nearfull: 0, total: 0 };
            this.objects = { criticalAlerts: 0, total: 0 };
            this.pools = { criticalAlerts: 0, down: 0, total: 0 };
            this.monitors = { criticalAlerts: 0, down: 0, total: 0 };
            this.trendsCharts = {
                overall: {title:"",data:{xData:[],yData:[]},config:{}},
                cpu: {title:"",data:{xData:[],yData:[]},config:{}},
                memory: {title:"",data:{xData:[],yData:[]},config:{}},
                iops: {title:"",data:{xData:[],yData:[]},config:{}},
                throughput: {title:"",data:{xData:[],yData:[]},config:{}},
                latency: {title:"",data:{xData:[],yData:[]},config:{}}
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
                    this.$location.path('/clusters');
                }else {
                    this.timer = this.intervalSvc(() => this.loadDashboardData(), 120 * 1000 );
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
            this.summary = summary;
            this.formatUtilizationData(summary.usage);
            this.formatUtilizationByProfileData(summary.storageprofileusage, summary.monitoringplugins);
            this.getMostUsedPools(summary.storageusage);
            this.osds = summary.slucount;
            this.hosts = summary.nodescount;
            this.clusters = summary.clusterscount;
            this.pools = summary.storagecount;
            if(summary.providermonitoringdetails.ceph) {
                this.monitors = summary.providermonitoringdetails.ceph.monitor;
                this.objects.total = summary.providermonitoringdetails.ceph.objects.num_objects;
                this.objects.criticalAlerts = summary.providermonitoringdetails.ceph.objects.num_objects_degraded;
                this.pgs = summary.providermonitoringdetails.ceph.pgnum;
            }
            this.changeTimeSlot(this.selectedTimeSlot);
            this.isLoading.summaryData = false;
        });
        this.getOverallUtilization();
    }

    /**
     *This is for overall utilization trend chart.
    */
    public getOverallUtilization() {
        this.serverService.getSystemOverallUtilization().then((overall_utilization) => {
            this.setGraphData(overall_utilization,"overall","","%","large");
        });
    }

    /**
     *This is the helper function for format the overall utilization data.
    */
    public formatUtilizationData(usage: UsageData) {
        this.capacity = usage;
        this.utilization.data = usage
        this.utilization.config.chartId = "utilizationChart";
        this.utilization.config.thresholds = {'warning':'60','error':'90'};
        this.utilization.config.centerLabelFn = () => {
              return ((usage.used * 100)/usage.total).toFixed(1) + "% Used";
        };
        this.utilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.isLoading.utilizationData = false;
    }

    /**
     *This is the helper function for format the utilization by profile data.
    */
    public formatUtilizationByProfileData(profiles: any, monitoringplugins: any) {
        this.utilizationByProfile.threshold = {};
        monitoringplugins.storage_profile_utilization.configs.forEach((config: any) => {
            this.utilizationByProfile.threshold[config.type] = config.value
        });
        this.utilizationByProfile.profiles = [];
        var othersProfile: UsageData = { "used": 0, "total": 0};
        Object.keys(profiles).forEach((profile) => {
            var usedData: any = profiles[profile]["utilization"];
            if(profile === 'default' || profile === 'sas' || profile === 'ssd') {
                this.utilizationByProfile.profiles.push({ "usage":usedData, "subtitle":profile });
            }else {
                othersProfile.used = othersProfile.used + profiles[profile]["utilization"]["used"];
                othersProfile.total = othersProfile.total + profiles[profile]["utilization"]["total"];
            }
        });
        if (othersProfile.total > 0) {
            this.utilizationByProfile.profiles.push({ "usage" : { "total": othersProfile.total, "used": othersProfile.used } , "subtitle" : "Others" });
        }
    }

    public getMostUsedPools(storageUsage) {
        this.mostUsedPools = [];
        _.each(storageUsage, (pool) => {
            this.mostUsedPools.push({"title":pool["name"],"data": {total: 100, used: pool["usage"]["percentused"]}});
        });
    }

    public getCpuUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.summary.utilizations.cpupercentageusage !== undefined && this.summary.utilizations.cpupercentageusage > 0) {
            usage = { "total":100, "used": this.summary.utilizations.cpupercentageusage }
        }
        this.setGraphUtilization(usage, "cpu");
        this.serverService.getSystemCpuUtilization(timeSlot.value).then((cpu_utilization) => {
            this.setGraphData(cpu_utilization,"cpu","","%","large");
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        var usage: any = {"total": 0,"used": 0};
        if(this.summary.utilizations.memoryusage !== undefined) {
            usage = { "total":this.summary.utilizations.memoryusage.total, "used": this.summary.utilizations.memoryusage.used }
        }
        this.setGraphUtilization(usage, "memory");
        this.serverService.getSystemMemoryUtilization(timeSlot.value).then((memory_utilization) => {
            this.setGraphData(memory_utilization,"memory","","%","large");
        });
    }

    public getIOPS(timeSlot: any) {
        this.serverService.getIOPS(timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K","compact");
        });
    }

    public getThroughput(timeSlot: any) {
        this.serverService.getThroughput(timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Throughput","KB/s","compact");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.serverService.getNetworkLatency(timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Latency","ms","compact");
        });
    }

    public setGraphUtilization(usage, graphName) {
        this.systemUtilization[graphName].data = usage
        this.systemUtilization[graphName].config.chartId = graphName;
        this.systemUtilization[graphName].config.thresholds = {'warning':'60','error':'90'};
        this.systemUtilization[graphName].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       ((d[0].value * 100)/usage.total).toFixed(1) + '% ' + d[0].name +
                     '</span>';
        };
        this.systemUtilization[graphName].config.centerLabelFn = () => {
              return ((usage.used * 100)/usage.total).toFixed(1) + "% Used";
        };
    }

    public setGraphData(graphArray, graphName, graphTitle, graphUnits, graphLayout) {
        var times = [];
        var used = [];
        times.push("dates");
        used.push("used");
        var isDataAvailable: boolean = false;
        if(graphArray.length !== 0 ) {
            var usageDataArray = graphArray[0].datapoints;
            isDataAvailable = (usageDataArray.length > 0 ? true : false);
            for (var index in usageDataArray) {
              var subArray = usageDataArray[index];
              times.push(new Date(subArray[1]));
              used.push(subArray[0].toFixed(1));
            }
        }
        this.trendsCharts[graphName] = {
            title: graphTitle,
            data: {
                  dataAvailable: isDataAvailable,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  graphName,
                title        :  graphTitle,
                layout       :  graphLayout,
                valueType    : 'actual',
                units        :  graphUnits,
                tooltipFn    :  function(d) {
                                    return  '<span class="donut-tooltip-pf">' +
                                              d[0].value + ' ' + graphUnits +
                                            '</span>';
                                }
            }
        }
        this.isLoading.trendsChartsData = false;
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
