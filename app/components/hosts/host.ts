
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
        this.timer = this.$interval(this.reloadData, 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
    }

    reloadData = () => {
        this.serverService.getList().then(this.updateHost);
    }

    updateHost = (hosts) => {
        var self = this;
        _.each(hosts, function(host: any) {
            var MockHost = self.MockDataProvider.getMockHost(host.hostname);
            host.hostnameShort = host.hostname.split(".")[0];
            host.alerts = MockHost.alerts;
            host.cpu_average = Math.round(Math.random() * 100);
            host.memory_average = Math.round(Math.random() * 100);
            host.cluster_type = 2;
            host.version = '';
            if (host.cluster != null) {
                self.clusterSvc.get(host.cluster).then(function(cluster) {
                    host.cluster_type = cluster.cluster_type;
                    host.version = host.cluster_type === 1 ? 'V3.7.1' : 'V9.0.1';
                });
            }
        });
        this.list = hosts;
    }

    public getClusterTypeTitle(type) {
        return this.clusterHelper.getClusterType(type).type;
    }

    public getNodeTypeTitle(node_type) {
        if (node_type === 1)
            return 'Monitor Host';
        else if (node_type === 2)
            return 'OSD Host';
        else if (node_type === 3)
            return 'OSD and Monitor';
        else
            return 'Gluster Host';
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

 