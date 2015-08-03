import {ClusterService} from '../rest/clusters';
import {MockDataProvider} from './mock-data-provider-helpers';
import {ClusterHelper} from './cluster-helpers';
import {VolumeService} from '';
import {PoolService} from '';
import {ServerService} from '';

export class ClustersController {
    private self = this;
    public clusterList: Array<any>;
    
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
        
    //This line refresh the content every 15 second.
    private timer = this.intervalSvc(this.reloadData, 15000);
    
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
        private serverService: ServerService,
        private clusterHelper: ClusterHelper,
        private mockDataProviderHelper: MockDataProvider) {
        clusterSvc.getList().then(this.updateData);

    }

    //This is to fix the 'this' problem with callbacks
    //Refer https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript#use-instance-functions
    updateData = (clusters) => {
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
        return ClusterHelper.getClusterType(type).type;
    }

    public getStorageTypeTitle(type: number): string {
        return ClusterHelper.getClusterType(type).type;
    }

    public getStatusTitle(type: number): string {
        return ClusterHelper.getClusterStatus(type).state;
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
    public expandCluster(clusterId: any): void {
        this.locationSvc.path('/clusters/expand/' + clusterId);
    }
    
    /**
     * This function helps in cleaning up or deleting the cluster with the help
     * of clusterId.
    */
    public removeCluster(clusterId: any): void {
        this.clusterSvc.remove(clusterId).then((result) => {
            this.reloadData();
        });
    }
    
    /**
     *This is the callback function called after getting clusters list. 
    */
    public clusterPromise = () => {
        var tempClusters: Array<any>;
        _.each(this.clusterList, (cluster) => {
            var mockCluster: any = this.mockDataProviderHelper.getMockCluster(cluster.clusterName);
            var tempCluster: any = {
                clusterId: cluster.clusterId,
                clusterName: cluster.clusterName,
                clusterType: cluster.clusterType,
                storageType: cluster.storageType,
                clusterStatus: cluster.clusterStatus,
                used: cluster.used,
                areaSplineCols: [{ id: 1, name: 'Used', color: '#39a5dc', type: 'area-spline' }],
                areaSplineValues: mockCluster.areaSpline_values,
                gaugeValues: _.random(20, 70) / 10,
                alerts: mockCluster.alerts,
                noOfVolumeOrPools: 0
            };

            if (tempCluster.used === 0) {
                tempCluster.areaSplineValues = [{ '1': 0 }, { '1': 0 }];
                tempCluster.gaugeValues = 0.5;
            }

            if (this.getClusterTypeTitle(cluster.clusterType) === 'Gluster') {
                this.volumeService.getListByCluster(cluster.clusterId).then((volumes) => {
                    tempCluster.noOfVolumeOrPools = volumes.length;
                });
            } else {
                this.poolService.getListByCluster(cluster.clusterId).then(function(pools) {
                    tempCluster.noOfVolumeOrPools = pools.length;
                });
            }
            tempClusters.push(tempCluster);
            
            //Lists to hold promises returned from ServerService and ClusterService.
            var hosts: Array<any>;
            var sizes: Array<any>;
            
            //Here we create a list of promises.
            _.each(tempClusters, (cluster) => {
                hosts.push(this.serverService.getListByCluster(cluster.clusterId));
                sizes.push(this.clusterSvc.getCapacity(cluster.clusterId));
            });
            
            //The promises that are stored in the list are taken out one by one and processed here. 
            this.qService.all(hosts).then((hostList) => {
                var index: number = 0;
                _.each(hostList, (host) => {
                    tempClusters[index].noOfHosts = host.length;
                    ++index;
                });
            });
            
            //Same thing is done here using the sizes list.
            this.qService.all(sizes).then((sizeList) => {
                var index: number = 0;
                _.each(sizeList, (size) => {
                    tempClusters[index].totalSize = size;
                    tempClusters[index].freeSize = size - tempClusters[index].used;
                    tempClusters[index].percentUsed = isNaN(Math.round(tempClusters[index].used * (100 / size))) ? 0 : Math.round(tempClusters[index].used * (100 / size));
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

