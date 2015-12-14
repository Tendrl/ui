// <reference path="../../../typings/tsd.d.ts" />

import {Cluster} from '../../rest/resources';

import {ClusterService} from '../../rest/clusters';
import {StorageService} from '../../rest/storage';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';

export class ObjectStorageController {
    private cluster: Cluster;
    private name: string;
    private count: number = 1;
    private types = ['Replicated', 'Erasure Coded'];
    private type = 'Replicated';
    private replicas: number = 3;
    private sizeUnits = ['GB', 'TB'];
    private targetSize = { value: 0, unit: 'GB' };
    private profiles = ['SAS', 'SSD', 'General'];
    private profile = 'SAS';
    private pools = [];

    static $inject: Array<string> = [
        '$routeParams',
        '$location',
        '$log',
        '$q',
        '$modal',
        'ClusterService',
        'StorageService',
        'RequestTrackingService'
    ];
    constructor(private $routeParams: ng.route.IRouteParamsService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private $modal,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService,
        private requestTrackingSvc: RequestTrackingService) {
        let clusterId = $routeParams['clusterid'];
        this.clusterSvc.get(clusterId).then(cluster => {
            this.cluster = cluster;
        });
    }

    public prepareSummary(): void {
        for (let index = 0; index < this.count; index++) {
            let pool = {
                name: this.name + index,
                type: this.type,
                profile: this.profile,
                replicas: this.replicas,
                capacity: this.targetSize,
            }
            this.pools.push(angular.copy(pool));
        }
    }

    public submit(): void {
        var list = [];
        for (let pool of this.pools) {
            let storage = {
                name: pool.name,
                type: 'replicated',
                replicas: pool.replicas,
                size: pool.capacity.value + pool.capacity.unit,
            };
            console.log(storage);
            list.push(this.storageSvc.create(this.cluster.clusterid, storage));
        }
        this.$q.all(list).then((result) => {
        });
    }
}
