
import {MockDataProvider} from '../clusters/mock-data-provider-helpers';
import {ClusterHelper} from '../clusters/cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class HostController {
    public list: Array<any>;
    private clusters: {};
    private hostStats: {};
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
        this.clusters = {};
        this.hostStats = {};
        this.timer = this.$interval(this.reloadData, 15000);
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
            if (self.hostStats[host.nodeid]) {
                host.cpu_average = Math.round(Math.random() * 70);
                host.memory_average = self.hostStats[host.nodeid].memAvg;
            }
            else {
                host.cpu_average = Math.round(Math.random() * 70);
                host.memory_average = Math.round(Math.random() * 70);
            }
            host.cluster_type = 2;
            host.version = '';
            if (host.clusterid != null && host.clusterid !== '00000000-0000-0000-0000-000000000000') {
                if (!self.clusters[host.clusterid]) {
                    self.clusterSvc.get(host.clusterid).then(function(cluster) {
                        host.cluster_type = cluster.type;
                        host.cluster_name = cluster.name;
                        self.clusters[host.clusterid] = { name: cluster.name, type: cluster.type };
                    });
                }
                else {
                    host.cluster_type = self.clusters[host.clusterid].type;
                    host.cluster_name = self.clusters[host.clusterid].name;
                    if(host.cluster_type === 1){
                        host.cluster_type_name = "Gluster";
                    }else if(host.cluster_type === 2){
                        host.cluster_type_name = "Ceph";
                    }
                }
            }
            else{
                host.cluster_type=0;
                host.cluster_type_name="Free";
                host.cluster_name="Unassigned";
            }
            self.serverService.getMemoryUtilization(host.nodeid).then((results) => {
                if (results != null && results !== 'null\n') {
                    var free = results[2].values[0][1];
                    var used = results[3].values[0][1];
                    var total = free + used;
                    var avg = Math.ceil((used / total) * 100);
                    self.hostStats[host.nodeid] = { memAvg: avg };
                }
            });
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

 