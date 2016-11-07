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
    private ecprofiles = [];
    private searchQuery: string;
    private paramsObject: any;
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
        'RequestTrackingService',
        'growl'
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
        private requestTrackingSvc: RequestTrackingService,
        private growl: any) {
        this.ecprofiles['default'] = '2+1';
        this.ecprofiles['k4m2'] = '4+2';
        this.ecprofiles['k6m3'] = '6+3';
        this.ecprofiles['k8m4'] = '8+4';
        this.paramsObject = $location.search();
        if (Object.keys(this.paramsObject).length > 0) {
            if ("tab" in this.paramsObject) {
                delete this.paramsObject.tab;
            }
            this.updateSearchQuery(this.paramsObject);
        }
        this.timer = this.$interval(() => this.refresh(), 60000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
        this.clusterSvc.getList().then(clusterlist => {
            this.clusters = clusterlist;
        });
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
            if (paramsObject[value] instanceof Array) {
                var queryArray = paramsObject[value].map(function(status) {
                    return value + '=' + status;
                })
                joinedStr = queryArray.join('&');
            } else {
                joinedStr = value + "=" + paramsObject[value];
            }
            if (this.searchQuery !== '') {
                this.searchQuery += "&"
            }
            this.searchQuery += joinedStr;
        });
    }

    public clearSearchQuery(key, itemIndex) {
        if (itemIndex === null) {
            delete this.paramsObject[key];
        } else {
            this.paramsObject[key].splice(itemIndex, 1);
        }
        this.updateSearchQuery(this.paramsObject);
        this.refresh();
    }

    public refresh() {
        if (this.clusterId) {
            // Current storage resource doesn't have cluster name, so here
            // we are fetching the cluster(s) in the system
            // This code will be removed once the storage resource includes
            // cluster name
            this.clusterSvc.get(this.clusterId).then((cluster) => {
                this.clusterMap[cluster.clusterid] = cluster;
                if (this.searchQuery === '') {
                    return this.storageSvc.getListByCluster(this.clusterId);
                } else {
                    return this.storageSvc.getFilteredListByCluster(this.clusterId, this.searchQuery);
                }
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
                if (this.searchQuery === '') {
                    return this.storageSvc.getList();
                } else {
                    return this.storageSvc.getFilteredList(this.searchQuery);
                }
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

    public isupdateNeed(storage, updatedStorage) {
        if (storage.replicas !== this.editPool.replicas || storage.quota_enabled !== updatedStorage.quota_enabled ||
            storage.quota_params.quota_max_bytes !== updatedStorage.quota_params.quota_max_bytes ||
            storage.quota_params.quota_max_objects !== updatedStorage.quota_params.quota_max_objects) {
            return true;
        }
    }

    public update(storage): void {
        let pool;
        pool = {
            quota_enabled: false,
            quota_params: {
                quota_max_bytes: "0",
                quota_max_objects: "0"
            }
        };
        pool.quota_enabled = this.editPool.quota_enabled;
        if (this.editPool.quota_enabled) {
            if (this.enable_quota_max_objects) {
                pool.quota_params.quota_max_objects = this.editPool.quota_params.quota_max_objects.toString();
            }
            if (this.enable_max_percentage) {
                pool.quota_params.quota_max_bytes = Math.round((this.maxPercentage / 100) * this.editPool.usage.total).toString();
            }
        }
        if (storage.type === 'replicated') {
            pool.replicas = this.editPool.replicas;
        }
        if (this.isupdateNeed(storage, pool)) {
            // PoolName should be update seperately... so that need to make two different calls*/
            this.storageSvc.update(storage.clusterid, storage.storageid, pool)
                .catch(error => {
                    this.growl.error("Cannot update pool" + storage.name);
                })
                .then(success => {
                    if(!this.updateName(storage)){
                        this.growl.success(storage.name + " update initiated");
                    }
                });
        } else {
            this.updateName(storage);
        }
        this.timer = this.$interval(() => this.refresh(), 60000);
    }

    public updateName(storage) {
        if (storage.name != this.editPool.name) {
            let poolName = {
                name: this.editPool.name
            };
            this.storageSvc.update(storage.clusterid, storage.storageid, poolName).catch(error => {
                this.growl.error("Cannot update pool name " + storage.name);
            }).then(success => {
                this.growl.success(storage.name + " update initiated");
            });
            return true;
        } else {
            return false;
        }
    }
    public edit(storage) {
        this.$interval.cancel(this.timer);
        this.timer = undefined;
        this.editPool = _.cloneDeep(storage);
        if (this.editPool.quota_params.quota_max_bytes) {
            this.enable_max_percentage = true;
            this.maxPercentage = Math.round((this.editPool.quota_params.quota_max_bytes / this.editPool.usage.total) * 100);
        }
        if (this.editPool.quota_params.quota_max_objects) {
            this.editPool.quota_params.quota_max_objects = parseInt(this.editPool.quota_params.quota_max_objects, 10);
            this.enable_quota_max_objects = true;
        }
    }
}
