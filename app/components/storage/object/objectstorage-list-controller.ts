/// <reference path="../../../../typings/tsd.d.ts" />

import {UtilService} from '../../rest/util';
import {ClusterService} from '../../rest/clusters';
import {StorageService} from '../../rest/storage';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import {numeral} from '../../base/libs';
import * as ModalHelpers from '../../modal/modal-helpers';

export class ObjectStorageListController {
    private clusterId: string;
    private list: Array<any>;
    private clusterMap = {};
    private timer;
    private clusters;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$timeout',
        '$q',
        '$modal',
        'ClusterService',
        'StorageService',
        'RequestService',
        'RequestTrackingService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private $q: ng.IQService,
        private $modal: any,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
        this.clusterSvc.getList().then(clusterlist => {
            this.clusters = clusterlist;
        });
    }

    public refresh() {
        if (this.clusterId) {
            // Current storage resource doesn't have cluster name, so here
            // we are fetching the cluster(s) in the system
            // This code will be removed once the storage resource includes
            // cluster name
            this.clusterSvc.get(this.clusterId).then((cluster) => {
                this.clusterMap[cluster.clusterid] = cluster;
                return this.storageSvc.getListByCluster(this.clusterId);
            }).then(list => {
                this.loadData(list);
            });
        }
        else {
            this.clusterSvc.getList().then((clusters: Array<any>) => {
                var requests = [];
                _.each(clusters, (cluster) => {
                    this.clusterMap[cluster.clusterid] = cluster;
                });
                return this.storageSvc.getList();
            }).then(list => {
                this.loadData(list);
            });
        }
    }

    public loadData(storages) {
        this.list = storages;
    }

    public getClusterName(clusterid) {
        return this.clusterMap[clusterid].name;
    }

    public create() {
        this.$location.path('/storage/new');
    }

    public remove(storage) {
        var modal = ModalHelpers.RemoveConfirmation(this.$modal, {
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
            if (confirmed) {
                this.storageSvc.delete(storage.clusterid, storage.storageid).then((task) => {
                    this.requestSvc.get(task.data.taskid).then((result) => {
                        this.requestTrackingSvc.add(result.id, result.name);
                    });
                });
            }
            $hide();
        });
    }

    public createCluster(): void {
        this.$location.path('/clusters/new');
    }
}
