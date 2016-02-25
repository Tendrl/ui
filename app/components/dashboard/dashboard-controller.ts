import {ServerService} from '../rest/server';
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
    private utilizationByProfile: any;

    static $inject: Array<string> = [
        '$scope',
        '$location',
        '$log',
        'ServerService'
    ];

    constructor(private $scope: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private serverService: ServerService) {

         this.utilization = { data: {}, config: {} };
         this.utilizationByProfile = {};
         this.capacity = {};
         this.clusters = { total: 0, error: 0 };
         this.hosts = { total: 0, error: 0, unaccepted: 0 };
         this.pgs = { total: 0, error: 0 };
         this.osds = { total: 0, error: 0 };
         this.objects = { total: 0, error: 0 };
         this.pools = { total: 0, down: 0 };
         this.monitors = { total: 0, error: 0 };
         this.serverService.getDashboardSummary().then((summary) => this.loadDashboardData(summary));
    }

    /**
     *This is the callback function called after getting summary data.
    */
    public loadDashboardData(summary: DashboardSummaryData) {
        if (summary.clusterscount.total === 0) {
            this.$location.path('/first');
        }
        else {
            this.formatlUtilizationData(summary.usage);
            this.formatlUtilizationByProfileData(summary.storageprofileusage);
            this.objects.total = summary.objectcnt;
            this.osds.total = summary.slucount.total;
            this.hosts = summary.nodescount;
            this.clusters = summary.clusterscount;
            this.pools = summary.storagecount;
            this.monitors.total = summary.providermonitoringdetails.ceph.monitor;
        }
    }

    /**
     *This is the helper function for format the overall utilization data.
    */
    public formatlUtilizationData(usage: UsageData) {
        this.capacity.total = numeral(usage.total).format('0 b');
        this.capacity.used = numeral(usage.used).format('0 b');
        this.utilization.data.total = usage.total;
        this.utilization.data.used = usage.used;
        this.utilization.config.chartId = "utilizationChart";
        this.utilization.config.thresholds = {'warning':'60','error':'90'};
        this.utilization.config.legend = {"show":false};
        this.utilization.config.centerLabelFn = () => {
              return Math.round(100 * (this.utilization.data.used / this.utilization.data.total)) + "% Used";
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
        for (var profile in profiles) {
            if (profiles.hasOwnProperty(profile)) {
                var usedData = Math.round(100 * (profiles[profile]["used"] / profiles[profile]["total"]));
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
            }
        }
        var othersProfilePercent = Math.round(100 * (othersProfile.used / othersProfile.total));
        if (othersProfilePercent > 0) {
            subdata.push({ "used" : othersProfilePercent , "color" : "#7dc3e8" , "subtitle" : "Others" });
        }
        this.utilizationByProfile.data = {
          'total': '100',
          'subdata' : subdata
        };
    }

}
