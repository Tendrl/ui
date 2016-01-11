
import {MockDataProvider} from '../clusters/mock-data-provider-helpers';
import {ClusterHelper} from '../clusters/cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class HostController {
    public list: Array<any>;
    private MockDataProvider = new MockDataProvider();
    private clusterHelper: ClusterHelper;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$timeout',
        'ClusterService',
        'ServerService',
        'UtilService',
        'RequestService'
    ];
    private timer;

    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private clusterSvc: ClusterService,
        private serverService: ServerService,
        private utilService: UtilService,
        private requestService: RequestService) {
        this.clusterHelper = new ClusterHelper(utilService, requestService, $log, $timeout);
        this.timer = this.$interval(this.reloadData, 10000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.reloadData();
    }

    reloadData = () => {
        this.serverService.getList().then(this.updateHost);
    }

    updateHost = (hosts) => {
        var self = this;
        _.each(hosts, function(host: any) {
            var MockHost = self.MockDataProvider.getMockHost(host.hostname);
            host.hostnameShort = host.hostname.split(".")[0];
            host.management_ip4 = '';
            host.status = host.status;
            host.alerts = MockHost.alerts;
            host.cpu_average = Math.round(Math.random() * 100);
            host.memory_average = Math.round(Math.random() * 100);
            host.cluster_type = 2;
            host.version = '';
            if (host.clusterid != null && host.clusterid !== '00000000-0000-0000-0000-000000000000') {
                self.clusterSvc.get(host.clusterid).then(function(cluster) {
                    host.cluster_type = cluster.type;
                    host.cluster_name = cluster.name;
                });
            }
        });
        this.list = hosts;
    }

    public getClusterTypeTitle(type) {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getNodeTypeTitle(node) {
        if (node.options1.mon === 'Y')
            return 'Monitor';
        else
            return 'OSD';
    }

    public getHostDonutColor(donut_value) {
        if (donut_value >= 90) return '#E35C5C';
        if (donut_value >= 80) return '#FF8C1B';
        else return '#4AD170';
    }

    public remove(node_id) {
        this.serverService.remove(node_id).then(function(result) {
            this.reloadData();
            console.log(result);
        });
    }
}

 