
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
    private clusterHelper: ClusterHelper;
    private searchQuery: string;
    private paramsObject: any;
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
        this.paramsObject = $location.search();
        if (Object.keys(this.paramsObject).length > 0) {
            if("tab" in this.paramsObject) {
                delete this.paramsObject.tab;
            }
            this.updateSearchQuery(this.paramsObject);
        }
        this.clusterHelper = new ClusterHelper(utilService, requestService, $log, $timeout);
        this.clusters = {};
        this.hostStats = {};
        this.timer = this.$interval(() => this.reloadData(), 60000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.reloadData();
    }

    public isArray(data): Boolean {
        return data instanceof Array;
    }

    public updateSearchQuery(paramsObject: any) {
        this.searchQuery = '';
        /*  paramsObject can have 3 case : -
                1) { status: [error,warning] , tab: <OSD,HOST,etc> }
                2) { tab: <OSD,HOST,etc> }
                3) { status: [error,warning] }
            and searchQuery will be like this : -
            /api/<ver>/clusters?status=ok&status=warning&tab=<HOST/OSD/etc>
        */
        Object.keys(paramsObject).forEach((value: any) => {
            let joinedStr = "";
            if(paramsObject[value] instanceof Array) {
                var queryArray = paramsObject[value].map(function(status) {
                  return value + '=' + status;
                })
                joinedStr = queryArray.join('&');
            }else {
                joinedStr = value + "=" + paramsObject[value];
            }
            if ( this.searchQuery !== '' ) {
                this.searchQuery += "&"
            }
            this.searchQuery += joinedStr;
        });
    }

    public clearSearchQuery(key, itemIndex) {
        if(itemIndex === null) {
            delete this.paramsObject[key];
        }else {
            this.paramsObject[key].splice(itemIndex, 1);
        }
        this.updateSearchQuery(this.paramsObject);
        this.reloadData();
    }

    public reloadData() {
        if(this.clusterId === undefined) {
            if(this.searchQuery === '') {
                this.serverService.getList().then(this.updateHost);
            }else {
                this.serverService.getFilteredList(this.searchQuery).then(this.updateHost);
            }
        }else {
            if(this.searchQuery === '') {
                this.serverService.getListByCluster(this.clusterId).then(this.updateHost);
            }else {
                this.serverService.getFilteredListByCluster(this.clusterId, this.searchQuery).then(this.updateHost);
            }
        }
    }

    updateHost = (hosts) => {
        var self = this;
        _.each(hosts, function(host: any) {
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
            self.serverService.getHostMemoryUtilization(host.nodeid,'').then((memory_utilization) => {
                self.hostStats[host.nodeid] = { memAvg: host.utilizations.memoryusage.percentused };
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
            return 'OSD Host';
    }

    public getHostDonutColor(donut_value) {
        if (donut_value >= 90) return '#CC0000';
        if (donut_value >= 80) return '#EC7A08';
        else return '#3F9C35';
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

    public createNewCluster(): void {
        this.$location.path('/clusters/new');
    }
}