import {ClusterHelper} from '../clusters/cluster-helpers';
import {MockDataProvider} from '../clusters/mock-data-provider-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

declare var require : any;
var numeral = require("numeral");
export class HostDetailController {
    private self = this;
    private capacity;
    private mockHost;
    private host;
    private iops;
    private mockDataProvider;
    private clusterHelper : ClusterHelper;
    private Id;

    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$log',
        '$routeParams',
        'ClusterService',
        'ServerService',
        'UtilService',
        'RequestService',
        '$timeout'
    ];

    constructor(private $q: ng.IQService,
        private $scope: ng.IScope,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $routeParams: ng.route.IRouteParamsService,
        private clusterSvc: ClusterService,
        private serverService: ServerService,
        private utilService: UtilService,
        private requestService: RequestService,
        private timeoutService: ng.ITimeoutService) {
        this.Id = this.$routeParams['id'];
        this.mockDataProvider = new MockDataProvider();
        this.clusterHelper = new ClusterHelper(utilService, requestService, $log, timeoutService);
        this.capacity = { free: 0, used: 0, total: 0 };
        this.host = {};
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
        this.iops.trends.values = this.mockDataProvider.getRandomList('1', 50, this.iops.writes, this.iops.total,false);

        this.mockHost = this.mockDataProvider.getMockCluster(undefined);
        this.mockHost.managementNetwork.inbound = _.random(3, 10);
        this.mockHost.managementNetwork.outbound = _.random(13, 25);
        this.mockHost.clusterNetwork.inbound = _.random(10, 20);
        this.mockHost.clusterNetwork.outbound = _.random(25, 40);

        this.serverService.get(this.Id).then(this.updateHost);
        this.serverService.getDiskStorageDevices(this.Id).then(this.updateDevice);
    }

    updateHost = (host: any) => {
        this.host.name = host.node_name.split(".")[0];
        if (host.cluster != null) {
            this.clusterSvc.get(host.cluster).then( (cluster) => {
                this.host.type = this.clusterHelper.getClusterType(cluster.cluster_type);
            });
        }
    }

    updateDevice = (devices) => {
        var totalSize = 0;
        var used = 0;
        _.each(devices, function(device: any) {
            totalSize = totalSize + device.size;
            if (device.inuse) {
                used = used + device.size;
            }
        });
        this.capacity.total = totalSize * 1073741824;
        this.capacity.used = used * 1073741824;
        this.capacity.free = this.capacity.total - this.capacity.used;
        this.capacity.values = [
            { '1': this.capacity.used },
            { '9': this.capacity.free }
        ];
        this.capacity.legends[0].color = this.getStatusColor(this.capacity.used / this.capacity.total * 100);
        this.capacity.trends.values = this.mockDataProvider.getRandomList('1', 50, this.capacity.used * 0.1, this.capacity.used, true);
    }

    public formatSize(bytes) {
        return numeral(bytes).format('0.0 b');
    }

    public getStatusColor(value: number) {
        if (value >= 90) return '#E35C5C';
        if (value >= 80) return '#FF8C1B';
        else return '#4AD170';
    };

}

