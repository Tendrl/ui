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
     private mockDataProvider : MockDataProvider;
     
    //This line refresh the content every 15 second.
    private timer;
    
    //This function helps in reloading the content for the cluster page.
    private reloading = false;
    
    /**
     * Here we do the dependency injection.
    */
    constructor(private qService: ng.IQService,
        private scopeSvc: ng.IScope,
        private intervalSvc: ng.IIntervalService,
        private locationSvc: ng.ILocationService,
        private volumeService: VolumeService,
        private clusterSvc: ClusterService,
        private poolService: PoolService,
        private serverService: ServerService) {
        this.clusterHelper = new ClusterHelper(null, null, null, null);
        this.mockDataProvider = new MockDataProvider();
        this.clusterSvc.getList().then((clusters) => this.updateData(clusters));
        this.timer = this.intervalSvc(() => this.reloadData(), 5000);
    }

    //This is to fix the 'this' problem with callbacks
    //Refer https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript#use-instance-functions
    public updateData(clusters) {
        this.clusterList = clusters;
        if (this.clusterList.length === 0) {
            this.locationSvc.path('/first');
        }
    }

    /**
     * This function helps in reloading the content of the page.
    */
    public reloadData() {
        if (this.reloading) {
            return;
        }
        this.reloading = true;
        this.clusterSvc.getList().then(this.clusterPromise);
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
    public getClusterTypeTitle(type: number): string {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getStorageTypeTitle(type: number): string {
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
        this.locationSvc.path('/clusters/new');
    }
    
    /**
     * Here we change the current path to '/clusters/expand/' where details about a particular
     * cluster can be seen. 
    */
    public expandCluster(clusterID: any): void {
        this.locationSvc.path('/clusters/expand/' + clusterID);
    }
    
    /**
     * This function helps in cleaning up or deleting the cluster with the help
     * of clusterID.
    */
    public removeCluster(clusterID: any): void {
        this.clusterSvc.remove(clusterID).then((result) => {
            this.reloadData();
        });
    }
    
    /**
     *This is the callback function called after getting clusters list. 
    */
    public clusterPromise = () => {
        var tempClusters: Array<any> = [];
        _.each(this.clusterList, (cluster) => {
            var mockCluster: any = this.mockDataProvider.getMockCluster(cluster.cluster_name);
            var tempCluster: any = {
                cluster_id: cluster.cluster_id,
                cluster_name: cluster.cluster_name,
                cluster_type: cluster.cluster_type,
                storage_type: cluster.storage_type,
                cluster_status: cluster.cluster_status,
                used: cluster.used,
                area_spline_cols: [{ ID: 1, name: 'Used', color: '#39a5dc', type: 'area-spline' }],
                area_spline_values: mockCluster.area_spline_values,
                gauge_values: _.random(20, 70) / 10,
                alerts: mockCluster.alerts,
                no_of_volume_or_pools: 0
            };

            if (tempCluster.used === 0) {
                tempCluster.area_spline_values = [{ '1': 0 }, { '1': 0 }];
                tempCluster.gauge_values = 0.5;
            }

            if (this.getClusterTypeTitle(cluster.cluster_type) === 'Gluster') {
                this.volumeService.getListByCluster(cluster.cluster_id).then((volumes) => {
                    tempCluster.no_of_volume_or_pools = volumes.length;
                });
            } else {
                this.poolService.getListByCluster(cluster.cluster_id).then(function(pools) {
                    tempCluster.no_of_volume_or_pools = pools.length;
                });
            }
            tempClusters.push(tempCluster);
            
            //Lists to hold promises returned from ServerService and ClusterService.
            var hosts: Array<any> = [];
            var sizes: Array<any> = [];
            
            //Here we create a list of promises.
            _.each(tempClusters, (cluster) => {
                hosts.push(this.serverService.getListByCluster(cluster.cluster_id));
                sizes.push(this.clusterSvc.getCapacity(cluster.cluster_id));
            });
            
            //The promises that are stored in the list are taken out one by one and processed here. 
            this.qService.all(hosts).then((hostList) => {
                var index: number = 0;
                _.each(hostList, (host) => {
                    tempClusters[index].no_of_hosts = host.length;
                    ++index;
                });
            });
            
            //Same thing is done here using the sizes list.
            this.qService.all(sizes).then((sizeList) => {
                var index: number = 0;
                _.each(sizeList, (size) => {
                    tempClusters[index].total_size = size;
                    tempClusters[index].free_size = size - tempClusters[index].used;
                    tempClusters[index].percent_ssed = isNaN(Math.round(tempClusters[index].used * (100 / size))) ? 0 : Math.round(tempClusters[index].used * (100 / size));
                    ++index;
                });

                this.clusterList = tempClusters;
                this.reloading = false;
            });

            if (this.clusterList.length === 0) {
                this.clusterList = tempClusters;
            }
        });
    }
}

