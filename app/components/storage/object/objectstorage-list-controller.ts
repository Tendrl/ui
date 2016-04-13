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
    private capacity;
    private editPool;
    private maxPercentage;
    private enable_max_percentage;
    private enable_quota_max_objects;
    private ecprofiles = [{ k: 2, m: 1, text: '2+1', value: 'default' }, { k: 4, m: 2, text: '4+2', value: 'k4m2' }, { k: 6, m: 3, text: '6+3', value: 'k6m3' }, { k: 8, m: 4, text: '8+4', value: 'k8m4' }];
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

    public update(storage): void {
        if(storage.name != this.editPool.name){
            let poolName = {
                name: this.editPool.name
            };
            // PoolName should be update seperately... so that need to make two different calls
            this.storageSvc.update(storage.clusterid, storage.storageid, poolName);
        }

        let pool;
        pool = {
             quota_enabled : this.editPool.quota_enabled,
             quota_params : {}
        };
        if(this.editPool.quota_enabled){
            pool.quota_params.quota_max_objects = this.editPool.quota_params.quota_max_objects;
            pool.quota_params.quota_max_bytes = Math.round((this.maxPercentage / 100) * this.capacity).toString();
        }
        if(storage.replicas != this.editPool.replicas || storage.quota_enabled != this.editPool.quota_enabled ||
        storage.quota_params.quota_max_bytes != pool.quota_params.quota_max_bytes ||
        storage.quota_params.quota_max_objects != pool.quota_params.quota_max_objects ){
            if (storage.type === 'replicated') {
                pool.replicas = this.editPool.replicas;
            }
            // PoolName should be update seperately... so that need to make two different calls*/
            this.storageSvc.update(storage.clusterid, storage.storageid, pool);
        }
        else {
            if(storage.options.ecprofile != this.editPool.options.ecprofile || storage.quota_enabled != this.editPool.quota_enabled ||
            storage.quota_params.quota_max_bytes != pool.quota_params.quota_max_bytes ||
            storage.quota_params.quota_max_objects != pool.quota_params.quota_max_objects  ){
                if(storage.type === 'erasure_coded'){
                    pool.options.ecprofile = this.editPool.options.ecprofile;
                }
                // PoolName should be update seperately... so that need to make two different calls*/
                this.storageSvc.update(storage.clusterid, storage.storageid, pool);
            }
        }
        this.timer = this.$interval(() => this.refresh(), 5000);
    }

    public edit(storage){
        this.$interval.cancel(this.timer);
        this.timer = undefined;
        this.editPool= _.clone(storage);
        if(this.editPool.quota_params.quota_max_bytes){
            this.enable_max_percentage = true;
            this.capacity = numeral().unformat(storage.size);
            this.maxPercentage = (this.editPool.quota_params.quota_max_bytes / this.capacity) *100;
        }
        if(this.editPool.quota_params.quota_max_objects){
            this.enable_quota_max_objects = true;
        }
    }
}
