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
        '$location',
        '$log',
        '$q',
        '$modal',
        'ClusterService',
        'StorageService',
        'RequestTrackingService'
    ];

    constructor(private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private $modal,
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
        this.$location.path('/storages');
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
        var requests = [];
        _.each(storageList, (storage) => {
            requests.push(this.storageSvc.create(clusterId, storage));
        });
        this.$q.all(requests).then((results) => {
            var modal = ModalHelpers.SuccessfulRequest(this.$modal, {
                title: 'Add OpenStack Storage Request is Submitted',
                container: '.usmClientApp'
            });
            modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                $hide();
                this.$location.path('/storages');
            });
        });
    }
}
