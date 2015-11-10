// <reference path="../../../typings/tsd.d.ts" />

import {ClusterService} from '../rest/clusters';
import {StorageService} from '../rest/storage';
import * as ModalHelpers from '../modal/modal-helpers';

export class OpenStackStorageController {
    private name: string;
    private clusters;
    private cluster;
    private openstackStorages = [];
    private replicaList = [2, 3, 4];
    private capacityUnits = ['GB', 'TB'];
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$q',
        '$modal',
        'ClusterService',
        'StorageService',
        'RequestTrackingService'
    ];

    constructor(private scopeSvc: ng.IScope,
        private intervalSvc: ng.IIntervalService,
        private locationSvc: ng.ILocationService,
        private logSvc: ng.ILogService,
        private $q: ng.IQService,
        private modal,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService,
        private RequestTrackingSvc) {
        this.clusters = [];
        this.clusterSvc.getList().then((clusters) => {
            this.clusters = clusters;
            if (this.clusters.length > 0) {
                this.cluster = this.clusters[0];
                this.onClusterSelected(this.cluster);
            }
        });
    }

    public onClusterSelected(selecteCluster) {
        var storages = [];
        _.each(selecteCluster.openstack_services, (service) => {
            storages.push({
                selected: false,
                service: service,
                name: service,
                type: 'Standard',
                storageProfile: 'SAS',
                replica: 3,
                capacity: { value: 10, unit: 'GB' },
                cache: undefined,
                edit: false
            });
        });
        this.openstackStorages = storages;
    }

    public isSubmitAvailable(): boolean {
        return true;
    }

    public cancel(): void {
        this.locationSvc.path('/storages');
    }

    public submit(): void {
        var selectedStorages = _.filter(this.openstackStorages, (storage) => storage.selected);
        var storageList = [];
        _.each(selectedStorages, (storage) => {
            storageList.push({
                name: storage.name,
                type: 'replicated',
                size: storage.capacity.value,
                options: { pgnum: '128' }
            });
        });
        console.log(storageList);
        this.createStorages(this.cluster.clusterid, storageList);
    }

    private createStorages(clusterId, storageList) {
        this.storageSvc.create(clusterId, storageList[0]).then((result) => {
            console.log(result);
            if (result.status === 200 || result.status === 202) {
                this.locationSvc.path('/storages');
            }
            else {
                this.logSvc.error('Unexpected response from Storages.create', result);
            }
        });
    }
}
