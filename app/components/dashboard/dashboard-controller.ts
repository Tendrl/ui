import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {StorageService} from '../rest/storage';
import {numeral} from '../base/libs';

export class DashboardController {
    private config: any;
    private clusters: Array<any>;
    private clustersWarning: Array<any>;
    private clustersCritical: Array<any>;
    private hosts: Array<any>;
    private hostsWarning: Array<any>;
    private hostsCritical: Array<any>;
    private storages: Array<any>;
    private storagesWarning: Array<any>;
    private storagesCritical: Array<any>;
    private services: Array<any>;
    private servicesWarning: Array<any>;
    private servicesCritical: Array<any>;
    private clusterTypes: Array<any>;
    private storageTiers: Array<any>;
    private totalCapacity: any;
    private trendCapacity: any;

    static $inject: Array<string> = [
        '$scope',
        '$location',
        '$log',
        'ClusterService',
        'ServerService',
        'StorageService'
    ];

    constructor(private $scope: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private storageService: StorageService) {

         this.clusters = new Array<any>();
         this.clustersWarning = new Array<any>();
         this.clustersCritical = new Array<any>();
         this.hosts = new Array<any>();
         this.hostsWarning = new Array<any>();
         this.hostsCritical = new Array<any>();
         this.storages = new Array<any>();
         this.storagesWarning = new Array<any>();
         this.storagesCritical = new Array<any>();
         this.services = new Array<any>();
         this.servicesWarning = new Array<any>();
         this.servicesCritical = new Array<any>();
         
         this.config = { capacityByType: true, capacityByTier: false };
         this.clusterTypes = [
            { id:1, name: 'Block', color: '#48b3ea', type: 'donut' },
            { id:2, name: 'File', color: '#0088ce' ,type: 'donut' },
            { id:3, name: 'Object', color: '#00659c', type: 'donut' },
            { id:9, name: 'Free', color: '#969696', type: 'donut' } ];
         this.storageTiers = [
            { id:1, name: 'Default', color: '#48b3ea', type: 'donut' },
            { id:2, name: 'Faster', color: '#0088ce', type: 'donut' },
            { id:3, name: 'Slower', color: '#00659c', type: 'donut' },
            { id:9, name: 'Free', color: '#969696', type: 'donut' } ];
         this.totalCapacity = {
                free: 0, used: 0, total: 0,
                freeFormatted: '0 B', usedFormatted: '0 B', totalFormatted: '0 B'
            };

         this.totalCapacity.legends = this.clusterTypes;
         this.totalCapacity.values = [];
         this.totalCapacity.byType = [];
         this.totalCapacity.byTier = [];
         this.services = [];

         this.trendCapacity = {};
         this.trendCapacity.legends = [
                { id:1, name: 'Used', color: '#39a5dc', type: 'area-spline' }
         ];
         this.trendCapacity.values = [];
         this.trendCapacity.selected = { used: 0, isTotal: true, type: '' };

         this.serverService.getList().then((hosts) => this.updateHostData(hosts));
         this.clusterService.getList().then((clusters) => this.updateClusterData(clusters));
         this.storageService.getList().then((storages) => this.updateStorageData(storages));
    }

    public updateClusterData(clusters: any) {
        if (clusters.length === 0) {
            this.$location.path('/first');
        }
        else {
            this.clusters = clusters;
            var requests = [];
            _.each(this.clusters, (cluster: any) => {
                if(cluster.status === 1) {
                    this.clustersWarning.push(cluster);
                }
                else if(cluster.status === 2) {
                    this.clustersCritical.push(cluster);
                }

                cluster.capacity = { total: 0, used: 0, free: 0 };
                this.clusterService.getCapacity(cluster.clusterid).then((size) => {
                    cluster.capacity.total = size,
                    cluster.capacity.used = 0,
                    cluster.capacity.free = cluster.capacity.total - cluster.capacity.used;
                    this.calculateTotalCapacity();
                });

                var iops = _.random(30000,60000);
                var iopsFormatted = numeral(iops).format('0,0');
                var bandwidth = _.random(500, 1500);
                var bandwidthFormatted = numeral(bandwidth).format('0,0');
                cluster.perf = {
                    iops: iops,
                    iopsFormatted: iopsFormatted,
                    bandwidth: bandwidth,
                    bandwidthFormatted: bandwidthFormatted
                };
            });
            this.calculateTotalCapacity();
        }
    }

    /**
     *This is the callback function called after getting hosts list. 
    */
    public updateHostData(hosts: any) {
       this.hosts = hosts;
        _.each(this.hosts, (host: any) => {
            if(host.status === 'down') {
                this.hostsCritical.push(host);
            }
            var cpu = _.random(70, 85);
            var memory = _.random(70, 85);
            host.perf = { cpu: cpu, memory: memory };
        });
    }

    /**
     *This is the callback function called after getting volumes list. 
    */
    public updateStorageData(storages: any) {
       this.storages = storages;
        _.each(this.storages, (storage: any) => {
            if(storage.status === 1) {
                this.storagesWarning.push(storage);
            }
            else if(storage.status === 2) {
                this.storagesCritical.push(storage);
            }
        });
    }

    public getRandomList(key: string , count: number, min: number, max: number) {
        var list = [];
        min = min > 0 ? min : 0;
        _.each(_.range(count), (index: number) => {
            var value = {};
            value[key] = _.random(min, max, true);
            list.push(value);
        });
        return list;
    }

    /**
     * calculateTotalCapacity function
     */
     public calculateTotalCapacity() {
        var byType = [0, 0, 0]; // block, file, object
        var byTier = [0, 0, 0]; // default, fast, slower
        var totalFree = 0;
        var totalUsed = 0;
        _.each(this.clusters, (cluster: any) => {
            var used = byType[cluster.storage_type-1];
            used = used + cluster.capacity.used;
            byType[cluster.storage_type-1] = used;
            byTier[0] = byTier[0] + used;
            totalFree = totalFree + cluster.capacity.free;
            totalUsed = totalUsed + cluster.capacity.used;
        });
         this.totalCapacity.byType = [
            { '1': byType[0] },
            { '2': byType[1] },
            { '3': byType[2] },
            { '9': totalFree }
        ];
         this.totalCapacity.byTier = [
            { '1': byTier[0] },
            { '2': byTier[1] },
            { '3': byTier[2] },
            { '9': totalFree }
        ];
        this.totalCapacity.free = totalFree;
        this.totalCapacity.used = totalUsed;
        this.totalCapacity.total = totalFree + totalUsed;
        this.totalCapacity.freeFormatted = numeral(totalFree).format('0.0 b');
        this.totalCapacity.usedFormatted = numeral(totalUsed).format('0.0 b');
        this.totalCapacity.totalFormatted = numeral(totalFree + totalUsed).format('0.0 b');
        if(this.config.capacityByType) {
            this.totalCapacity.legends = this.clusterTypes;
            this.totalCapacity.values = this.totalCapacity.byType;
        }
        else {
            this.totalCapacity.legends = this.storageTiers;
            this.totalCapacity.values = this.totalCapacity.byTier;
        }
        this.trendCapacity.values = this.getRandomList('1', 50, totalUsed-(totalUsed * 0.1), totalUsed);
        this.trendCapacity.selected.used = totalUsed;
        this.trendCapacity.selected.usedFormatted = numeral(totalUsed).format('0.0 b');
    }    

    public switchCapacityCategory(execute: any) {
        if(execute) {
            this.config.capacityByType = !this.config.capacityByType;
            this.config.capacityByTier = !this.config.capacityByTier;
            if(this.config.capacityByType) {
                this.totalCapacity.legends = this.clusterTypes;
                this.totalCapacity.values = this.totalCapacity.byType;
            }
            else {
                this.totalCapacity.legends = this.storageTiers;
                this.totalCapacity.values = this.totalCapacity.byTier;
            }
        }
    }

    public selectClusterCapacityLegend(data: any) {
        var isFreeSelected = data.id === '9';
        var used = isFreeSelected ? this.totalCapacity.used : data.value;
        this.trendCapacity.values = this.getRandomList('1', 50, used-(used * 0.1), used);
        this.trendCapacity.selected.used = used;
        this.trendCapacity.selected.usedFormatted = numeral(used).format('0 b');
        this.trendCapacity.selected.isTotal = isFreeSelected;
        this.trendCapacity.selected.type = data.name;
    }

    public getHeatLevel(usage: number) {
        if(usage > 90) {
            return 'heat-l0';
        }
        else if (usage > 80) {
            return 'heat-l1';
        }
        else if (usage > 70) {
            return 'heat-l2';
        }
        else {
            return 'heat-l3';
        }
    }

}
