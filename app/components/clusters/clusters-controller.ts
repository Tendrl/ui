import {ClusterService} from '../rest/clusters';
import {MockDataProvider} from './mock-data-provider-helpers';
import {ClusterHelper} from './cluster-helpers';
import {VolumeService} from '../rest/volume';
import {PoolService} from '../rest/pool';
import {ServerService} from '../rest/server';

export class ClustersController {
    private self = this;
    public clusterList: Array<any>;
    private clusterHelper: ClusterHelper;
    
    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$interval',
        '$location',
        'VolumeService',
        'ClusterService',
        'PoolService',
        'ServerService',
    ];
        
    //Mock-Data incase if data not available 
    private mockDataProvider: MockDataProvider;
     
    //This line refresh the content every 15 second.
    private timer;
        
    /**
     * Here we do the dependency injection.
    */
    constructor(private $q: ng.IQService,
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private volumeService: VolumeService,
        private clusterSvc: ClusterService,
        private poolService: PoolService,
        private serverService: ServerService) {
        this.clusterHelper = new ClusterHelper(null, null, null, null);
        this.mockDataProvider = new MockDataProvider();
        this.timer = this.$interval(() => this.refresh(), 10000);
        this.refresh();
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
    }

    /**
     * This function helps in loading the content of the page.
    */
    public refresh() {
        this.clusterSvc.getList().then((clusters) => {
            if (clusters.length === 0) {
                this.$location.path('/first');
            }
            this.loadData(clusters);
        });
    }

    public loadData(clusters) {
        var tempClusters: Array<any> = [];
        _.each(clusters, (cluster: any) => {
            var mockCluster: any = {};
            mockCluster = this.mockDataProvider.getMockCluster(cluster.name);
            var tempCluster: any = {
                clusterid: cluster.clusterid,
                cluster_name: cluster.name,
                cluster_type: cluster.type,
                storage_type: cluster.storage_type,
                cluster_status: cluster.cluster_status,
                used: cluster.used,
                area_spline_cols: [{ id: 1, name: 'Used', color: '#39a5dc', type: 'area-spline' }],
                area_spline_values: mockCluster.areaSplineValues,
                gauge_values: _.random(20, 70) / 10,
                no_of_hosts: 0,
                alerts: mockCluster.alerts,
                no_of_volumes_or_pools: 0
            };

            if (tempCluster.used === 0) {
                tempCluster.area_spline_values = [{ '1': 0 }, { '1': 0 }];
                tempCluster.gauge_values = 0.5;
            }

            this.serverService.getListByCluster(cluster.clusterid).then((nodes) => {
                tempCluster.no_of_hosts = nodes.length;
            });

            if (this.getClusterTypeTitle(cluster.type) === 'gluster') {
                this.volumeService.getListByCluster(cluster.cluster_id).then((volumes) => {
                    tempCluster.no_of_volume_or_pools = volumes.length;
                });
            }
            else {
                this.poolService.getListByCluster(cluster.cluster_id).then(function(pools) {
                    tempCluster.no_of_volume_or_pools = pools.length;
                });
            }

            tempCluster.total_size = 0;
            tempCluster.free_size = 0;
            tempCluster.percent_used = 0;

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
            return '#E35C5C';
        } else if (gaugeValue >= 80) {
            return '#FF8C1B';
        } else {
            return '#4AD170';
        }
    }
    
    /**
     * These are the methods needed to access the members of the class.
    */
    public getClusterTypeTitle(type: string): string {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getStorageTypeTitle(type: string): string {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getStatusTitle(type: number): string {
        return this.clusterHelper.getClusterStatus(type).state;
    }
    
    /**
     * Here we change the current path to '/clusters/new' where new clusters can be created
     * with the help of the UI provided.
    */
    public createNewCluster(): void {
        this.$location.path('/clusters/new');
    }
    
    /**
     * Here we change the current path to '/clusters/expand/' where details about a particular
     * cluster can be seen. 
    */
    public expandCluster(clusterID: any): void {
        this.$location.path('/clusters/expand/' + clusterID);
    }

    public enableCluster(clusterID: any): void {
        this.clusterSvc.enable(clusterID).then(() => {
            this.refresh();
        });
    }

    public disableCluster(clusterID: any): void {
        this.clusterSvc.disable(clusterID).then(() => {
            this.refresh();
        });
    }

    /**
     * This function helps in cleaning up or deleting the cluster with the help
     * of clusterID.
    */
    public removeCluster(clusterID: any): void {
        this.clusterSvc.remove(clusterID).then((result) => {
            this.refresh();
        });
    }
}
