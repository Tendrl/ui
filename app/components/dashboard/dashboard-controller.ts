import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {NodeStatus} from '../rest/server';
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
        'ClusterService',
        'ServerService'
    ];

    constructor(private $scope: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private clusterService: ClusterService,
        private serverService: ServerService) {

         this.utilization = { data: {}, config: {} };
         this.utilizationByProfile = {};
         this.clusters = { total: 0, warning: 0, critical: 0 };
         this.hosts = { total: 0, warning: 0, critical: 0, unaccepted: 0 };
         this.pgs = { total: 0, warning: 0, critical: 0 };
         this.osds = { total: 0, warning: 0, critical: 0 };
         this.objects = { total: 0, warning: 0, critical: 0 };
         this.pools = { total: 0, warning: 0, critical: 0 };
         this.monitors = { total: 0, warning: 0, critical: 0 };
         this.capacity = {};
         this.serverService.getDashboardSummary().then((summary) => this.loadDashboardData(summary));
         this.serverService.getList().then((nodes) => this.loadMonitors(nodes));
    }

    /**
     *This is the callback function called after getting summary data.
    */
    public loadDashboardData(summary: any) {
        if (summary.clusterscount.total === 0) {
            this.$location.path('/first');
        }
        else {
            //overall utilization data
            this.capacity.total = numeral(summary.usage.total).format('0 b');
            this.capacity.used = numeral(summary.usage.used).format('0 b');
            this.utilization.data.total = summary.usage.total;
            this.utilization.data.used = summary.usage.used;
            this.utilization.config.chartId = "utilizationChart";
            this.utilization.config.thresholds = {'warning':'60','error':'90'};
            this.utilization.config.legend = {"show":false};
            this.utilization.config.tooltipFn = (d) => {
                  return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                           numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                         '</span>';
            };
            this.utilization.config.centerLabelFn = () => {
                  return Math.round(100 * (this.utilization.data.used / this.utilization.data.total)) + "% Used";
            };


            //storage utilization by profile
            this.utilizationByProfile.title = 'Utilization by storage profile';
            this.utilizationByProfile.layout = {
              'type': 'multidata'
            };
            var profiles = summary.storageprofileusage;
            var subdata = [];
            var othersProfile = { "used": 0, "total": 0};
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

            this.objects.total = summary.objectcnt;
            this.osds.total = summary.slucount.total;
            this.hosts.total = summary.nodescount.total;
            this.hosts.critical = summary.nodescount.error;
            this.hosts.unaccepted = summary.nodescount.unaccepted;
            this.clusters.total = summary.clusterscount.total;
            this.clusters.critical = summary.clusterscount.error;
        }
    }

    /**
     *This is the callback function called after getting monitors list.
    */
    public loadMonitors(nodes: Array<any>) {
        _.each(nodes, (node: any) => {
            if (node.options1.mon === 'Y') {
                this.monitors.total++;
                if(node.status === NodeStatus.ERROR) {
                    this.monitors.critical++;
                }
            }
        });
    }

}
