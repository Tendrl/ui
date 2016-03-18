
import {MockDataProvider} from '../clusters/mock-data-provider-helpers';
import {ClusterHelper} from '../clusters/cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';
import * as ModalHelpers from '../modal/modal-helpers';

export class HostListController {
    private clusterId: any;
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
        '$modal',
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
        private $modal: any,
        private $timeout: ng.ITimeoutService,
        private clusterSvc: ClusterService,
        private serverService: ServerService,
        private utilService: UtilService,
        private requestService: RequestService) {
        this.clusterHelper = new ClusterHelper(utilService, requestService, $log, $timeout);
        this.clusters = {};
        this.hostStats = {};
        this.timer = this.$interval(() => this.reloadData(), 7000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.reloadData();
    }

    public reloadData() {
        if(this.clusterId === undefined) {
            this.serverService.getList().then(this.updateHost);
        }else {
            this.serverService.getListByCluster(this.clusterId).then(this.updateHost);
        }
    }

    updateHost = (hosts) => {
        var self = this;
        _.each(hosts, function(host: any) {
            host.hostnameShort = host.hostname.split(".")[0];
            host.alerts = 0;
            if (self.hostStats[host.nodeid]) {
                host.cpu_average = Math.round(Math.random() * 70);
                host.memory_average = self.hostStats[host.nodeid].memAvg;
            }
            else {
                host.cpu_average = Math.round(Math.random() * 70);
                host.memory_average = Math.round(Math.random() * 70);
            }
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
                }
            }
            else {
                host.cluster_type = "Free";
                host.cluster_name = "Unassigned";
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

    public removeHost(host): void {
        var modal = ModalHelpers.RemoveConfirmation(this.$modal, {
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
            if(confirmed) {
                this.serverService.delete(host.hostname);
            }
            $hide();
        });
    }

    public reinitialize(host): void {
        this.serverService.reinitialize(host.hostname);
    }
}