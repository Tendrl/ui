// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {ClusterService} from '../rest/clusters';
import {StorageService} from '../rest/storage';

export class StorageListController {
    private list: Array<any>;
    private timer;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$timeout',
        '$q',
        'ClusterService',
        'StorageService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private $q: ng.IQService,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.clusterSvc.getList().then((clusters: Array<any>) => {
            var requests = [];
            _.each(clusters, (cluster) => {
                requests.push(this.storageSvc.getListByCluster(cluster.clusterid));
            });
            this.$q.all(requests).then((results) => {
                var storageList = [];
                _.each(results, (result) => {
                    Array.prototype.push.apply(storageList, result);
                });
                this.loadData(storageList);
            });
        });
    }

    public loadData(storages) {
        this.list = storages;
    }

    public create() {
        this.$location.path('/storages/new');
    }

    public remove(storage) {
        this.storageSvc.delete(storage.clusterid, storage.storageid).then((result) => {
            this.refresh();
        });
    }
}
