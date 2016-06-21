
import {Cluster} from '../rest/clusters';
import {ClusterState} from '../rest/clusters';
import {ClusterService} from '../rest/clusters';
import {ClusterHelper} from './cluster-helpers';
import {VolumeService} from '../rest/volume';
import {StorageService} from '../rest/storage';
import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {RequestTrackingService} from '../requests/request-tracking-svc';
import * as ModalHelpers from '../modal/modal-helpers';

export class ClustersController {
    public clusterList: Array<any>;
    private clusterHelper: ClusterHelper;
    private searchQuery: string;
    private paramsObject: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$interval',
        '$location',
        '$modal',
        'VolumeService',
        'ClusterService',
        'StorageService',
        'ServerService',
        'RequestService',
        'RequestTrackingService'
    ];

    //Timer to refresh the data every 10 seconds
    private timer;

    /**
     * Here we do the dependency injection.
    */
    constructor(private $q: ng.IQService,
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $modal,
        private volumeService: VolumeService,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService,
        private serverService: ServerService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {
        this.paramsObject = $location.search();
        if (Object.keys(this.paramsObject).length > 0) {
            this.updateSearchQuery(this.paramsObject);
        }
        this.clusterHelper = new ClusterHelper(null, null, null, null);
        this.timer = this.$interval(() => this.refresh(), 10000);
        this.refresh();
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
    }

    public isArray(data): Boolean {
        return data instanceof Array;
    }

    public updateSearchQuery(paramsObject: any) {
        this.searchQuery = '';
        /*  paramsObject can have 3 case : -
                1) { status: [error,warning] , tab: <OSD,HOST,etc> }
                2) { tab: <OSD,HOST,etc> }
                3) { status: [error,warning] }
            and searchQuery will be like this : -
            /api/<ver>/clusters?status=ok&status=warning&tab=<HOST/OSD/etc>
        */
        Object.keys(paramsObject).forEach((value: any) => {
            let joinedStr = "";
            if(paramsObject[value] instanceof Array) {
                var queryArray = paramsObject[value].map(function(status) {
                  return value + '=' + status;
                })
                joinedStr = queryArray.join('&');
            }else {
                joinedStr = value + "=" + paramsObject[value];
            }
            if ( this.searchQuery !== '' ) {
                this.searchQuery += "&"
            }
            this.searchQuery += joinedStr;
        });
    }

    public refresh() {
        if(this.searchQuery === '') {
            this.clusterSvc.getList().then((clusters: Cluster[]) => {
                this.loadData(clusters);
            });
        }else {
            this.clusterSvc.getFilteredList(this.searchQuery).then((clusters: Cluster[]) => {
                this.loadData(clusters);
            });
        }
    }

    public clearSearchQuery(key, itemIndex) {
        if(itemIndex === null) {
            delete this.paramsObject[key];
        }else {
            this.paramsObject[key].splice(itemIndex, 1);
        }
        this.updateSearchQuery(this.paramsObject);
        this.refresh();
    }

    /**
     * This function helps in loading the content of the page.
    */
    public loadData(clusters: Cluster[]) {
        var tempClusters: Array<any> = [];
        _.each(clusters, (cluster) => {
            var tempCluster: any = {
                clusterid: cluster.clusterid,
                cluster_name: cluster.name,
                cluster_type: cluster.type,
                state: cluster.state,
                status: cluster.status,
                used: undefined,
                no_of_hosts: 0,
                almwarncount: cluster.almwarncount,
                almcritcount: cluster.almcritcount,
                no_of_volumes_or_pools: 0,
                trendsCharts : {title:"",data:{xData:[],yData:[]},config:{}},
                total_size: 0,
                free_size: 0,
                percent_used: 0
            };

            if (tempCluster.used === 0) {
                tempCluster.area_spline_values = [{ '1': 0 }, { '1': 0 }];
                tempCluster.gauge_values = 0.5;
            }

            this.clusterSvc.getIOPSById(cluster.clusterid, "-10min").then((iops) => {
                var times = [];
                var used = [];
                times.push("dates");
                used.push("used");
                var usageDataArray = iops[0].datapoints;
                for (var index in usageDataArray) {
                    var subArray = usageDataArray[index];
                    times.push(new Date(subArray[1]));
                    used.push(subArray[0].toFixed(1));
                }
                tempCluster.trendsCharts = {
                    title: "IOPS",
                    data: {
                        dataAvailable: true,
                        xData: times,
                        yData: used
                    },
                    config: {
                        chartId:cluster.name + "-iops",
                        title: "IOPS",
                        layout: 'compact',
                        valueType: 'actual',
                        units: "K",
                    }
                }
            });

            this.clusterSvc.getClusterSummary(cluster.clusterid).then((summary) => {
                tempCluster.total_size = summary.usage.total;
                tempCluster.free_size = summary.usage.total - summary.usage.used;
                tempCluster.percent_used = summary.usage.percentused;
            });

            this.serverService.getListByCluster(cluster.clusterid).then((nodes) => {
                tempCluster.no_of_hosts = nodes.length;
            });

            this.clusterSvc.getAlerts(cluster.clusterid).then((alerts) => {
                tempCluster.alerts = alerts;
            });

            if (this.getClusterTypeTitle(cluster.type) === 'gluster') {
                this.volumeService.getListByCluster(cluster.clusterid).then((volumes) => {
                    tempCluster.no_of_volume_or_pools = volumes.length;
                });
            }
            else {
                this.storageSvc.getListByCluster(cluster.clusterid).then(function(pools) {
                    tempCluster.no_of_volumes_or_pools = pools.length;
                });
            }

            tempClusters.push(tempCluster);
        });
        this.clusterList = tempClusters;
    }

    /**
     * This returns the color for the gauge.
    */
    public getClusterGaugeColor(gaugeValue: number): string {
        gaugeValue = gaugeValue * 10;
        if (gaugeValue >= 90) {
            return '#CC0000';
        } else if (gaugeValue >= 80) {
            return '#EC7A08';
        } else {
            return '#3F9C35';
        }
    }

    public getClusterTypeTitle(type: string): string {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getStorageTypeTitle(type: string): string {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getStatusTitle(type: number): string {
        return this.clusterHelper.getClusterStatus(type).state;
    }

    public createNewCluster(): void {
                this.$location.path('/clusters/new');
    }

    public importCluster(): void {
        this.$location.path("/clusters/import");
    }

    public isExpandAvailable(clusterState: ClusterState) {
        return clusterState === ClusterState.ACTIVE;
    }

    public isManageAvailable(clusterState: ClusterState) {
        return clusterState === ClusterState.UNMANAGED;
    }

    public isUnManageAvailable(clusterState: ClusterState) {
        return clusterState === ClusterState.FAILED || clusterState === ClusterState.ACTIVE;
    }

    public isForgetAvailable(clusterState: ClusterState) {
        return clusterState === ClusterState.UNMANAGED;
    }

    /**
     * Here we change the current path to '/clusters/expand/' where the cluster can be extended
     * by adding new nodes to it.
    */
    public expandCluster(clusterID: string, clusterState: ClusterState): void {
        if (!this.isExpandAvailable(clusterState)) {
            return;
        }
        this.$location.path('/clusters/expand/' + clusterID);
    }

    public enableCluster(clusterID: string, clusterState: ClusterState): void {
        if (!this.isManageAvailable(clusterState)) {
            return;
        }
        this.clusterSvc.enable(clusterID).then((result) => {
            this.requestSvc.get(result.taskid).then((task) => {
                this.requestTrackingSvc.add(task.id, task.name);
            });
        });
    }

    public disableCluster(clusterID: string, clusterState: ClusterState): void {
        if (!this.isUnManageAvailable(clusterState)) {
            return;
        }
        this.clusterSvc.disable(clusterID).then((result) => {
            this.requestSvc.get(result.taskid).then((task) => {
                this.requestTrackingSvc.add(task.id, task.name);
            });
        });
    }

    /**
     * This function helps in deleting the cluster with the help
     * of clusterID.
    */
    public removeCluster(clusterID: string, clusterState: ClusterState): void {
        if (!this.isForgetAvailable(clusterState)) {
            return;
        }
        this.clusterSvc.remove(clusterID).then((result) => {
            this.requestSvc.get(result.taskid).then((task) => {
                this.requestTrackingSvc.add(task.id, task.name);
            });
        });
    }
}
