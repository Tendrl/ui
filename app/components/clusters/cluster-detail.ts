// <reference path="../typings/tsd.d.ts" />

import {ClusterHelper} from './cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {VolumeService} from '../rest/volume';
import {PoolService} from '../rest/pool';
import {MockDataProvider} from './mock-data-provider-helpers';

declare var require: any;
var numeral = require("numeral");

export class ClusterDetailController {
    private mockDataProvider: MockDataProvider;
    private clusterHelpers: ClusterHelper;
    private id: any;
    private cluster: any;
    private capacity: any;
    private iops: any;
    private hosts: any;
    private volumes: any;
    private bricks: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private mockCluster: any;
    
    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$log',
        '$routeParams',
        'ClusterService',
        'ServerService',
        'VolumeService',
        'PoolService',
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private locationService: ng.ILocationService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private volumeService: VolumeService,
        private poolService: PoolService) {

        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.mockDataProvider = new MockDataProvider();
        
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.cluster.volumes = [];
        this.capacity = { free: 0, used: 0, total: 0 };
        this.capacity.legends = [
            { id: 1, name: 'Used', color: '#4AD170', type: 'donut' },
            { id: 9, name: 'Free', color: '#CCCCCC', type: 'donut' }
        ];
        this.capacity.values = [];
        this.capacity.trends = {};
        this.capacity.trends.cols = [
            { id: 1, name: 'Used', color: '#39a5dc', type: 'area-spline' }
        ];
        this.capacity.trends.values = [];
        
        this.iops = { reads: _.random(200, 700) / 100, writes: _.random(100, 200) / 100 };
        this.iops.total = this.iops.reads + this.iops.writes;
        this.iops.trends = {};
        this.iops.trends.cols = [
            { id: 1, name: 'Using', color: '#39a5dc', type: 'area' }
        ];

        this.hosts = { total: 0, warning: 0, critical: 0 };
        this.volumes = { total: 0, warning: 0, critical: 0 };
        this.bricks = { total: 0, warning: 0, critical: 0 };
        this.pools = { total: 0, warning: 0, critical: 0 };
        this.pgs = { total: 1024, warning: 0, critical: 0 };
        this.osds = { total: 3, warning: 0, critical: 0 };
        
        this.iops.trends.values = this.mockDataProvider.getRandomList('1', 50, this.iops.writes, this.iops.total, undefined)
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.serverService.getListByCluster(this.id).then((hosts) => this.getHostStatus(hosts));
        this.poolService.getListByCluster(this.id).then((pools) => this.getPoolsLength(pools));
        this.volumeService.getListByCluster(this.id).then((volumes) => this.getVolumeStatus(volumes)).then((bricks) => this.getBricksStatus(bricks));
       
        _.each(_.range(0, 25), (index) => {
            this.cluster.volumes.push({ id: _.random(0, 100), utilization: _.random(0, 100), performance: _.random(0, 100), uptime: _.random(0, 100) });
        });
        
        this.mockCluster = this.mockDataProvider.getMockCluster(undefined);
        this.mockCluster.managementNetwork.inbound = _.random(3, 10);
        this.mockCluster.managementNetwork.outbound = _.random(13, 25);
        this.mockCluster.clusterNetwork.inbound = _.random(10, 20);
        this.mockCluster.clusterNetwork.outbound = _.random(25, 40);
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.cluster_name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.capacity.used = cluster.used * 1073741824;

        this.clusterService.getCapacity(this.id).then((capacity: any) => {
            this.capacity.total = capacity * 1073741824;
            this.capacity.free = this.capacity.total - this.capacity.used;
            this.capacity.values = [
                { '1': this.capacity.used },
                { '9': this.capacity.free }
            ];
            this.capacity.legends[0].color = this.getStatusColor(this.capacity.used / this.capacity.total * 100);
            this.capacity.trends.values = this.mockDataProvider.getRandomList('1', 50, this.capacity.used * 0.1, this.capacity.used, true);
        });
    }

    public getStatusColor(value: any) {
        if (value >= 90) return '#E35C5C';
        if (value >= 80) return '#FF8C1B';
        else return '#4AD170';
    }

    public getHostStatus(hosts: any) {
        this.hosts.total = hosts.length;
        var warning = 0, critical = 0;
        _.each(hosts, (host: any) => {
            if (host.node_status === 1) {
                critical++;
            }
        });
        this.hosts.critical = critical;
    }

    public getPoolsLength(pools: any) {
        this.pools.total = pools.length;
    }

    public getVolumeStatus(volumes: any) {
        var brickPromises: Array<any> = [];
        this.volumes.total = volumes.length;
        var warning = 0, critical = 0;

        _.each(volumes, (volume: any) => {
            if (volume.volume_status === 1) {
                warning++;
            } else if (volume.volume_status === 2 || volume.volume_status === 3) {
                critical++;
            }
            brickPromises.push(this.volumeService.getBricks(volume.volume_id));
        });

        this.volumes.critical = critical;
        this.volumes.warning = warning;
        return this.qService.all(brickPromises);
    }

    public getBricksStatus(bricks: any) {
        var total = 0, warning = 0, critical = 0;
        _.each(bricks, (brickList: any) => {
            _.each(brickList, (brick: any) => {
                if (brick.brick_status === 1) {
                    warning++;
                } else if (brick.brick_status === 2 || brick.brick_status === 3) {
                    critical++;
                }
                total++;
            });
        });
        this.bricks.total = total;
        this.bricks.critical = critical;
        this.bricks.warning = warning;
    }

    public formatSize(bytes: any) {
        return numeral(bytes).format('0.0 b');
    }

    public getHeatLevel(usage: any) {
        if (usage > 90) {
            return 'heat-l0';
        } else if (usage > 80) {
            return 'heat-l1';
        } else if (usage > 70) {
            return 'heat-l2';
        } else {
            return 'heat-l3';
        }
    }
}
