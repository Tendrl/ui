/// <reference path="../../../typings/tsd.d.ts" />

import {VolumeService} from '../rest/volume';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {VolumeHelpers} from './volume-helpers';
import * as ModalHelpers from '../modal/modal-helpers';
import {RequestTrackingService} from '../requests/request-tracking-svc';

import {Tier, SizeUnit, DisperseOption} from './volume-models';

export class VolumeNewController {
    private step = 1;
    private clusters: Array<any>;
    private cluster: any;
    private name: string;
    private type = 1;
    private copyCountList: Array<number>;
    private copyCount: number;
    private targetSizeUnits: Array<SizeUnit>;
    private targetSizeUnit: SizeUnit;
    private tierList: Array<Tier>;
    private tier: Tier;
    private disperseOptions: Array<DisperseOption>;
    private disperseOption: DisperseOption;
    private maxAvailableSpace = false;
    private cacheTierByPercentage = 1;
    private targetSize: number;
    private actualSize = 0;
    private storageDevices: Array<any>;
    static $inject: Array<string> = [
        '$q',
        '$log',
        '$location',
        '$modal',
        'ClusterService',
        'ServerService',
        'VolumeService',
        'RequestTrackingService'];
    constructor(
        private $q: ng.IQService,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $modal: any,
        private clusterSvc: ClusterService,
        private serverSvc: ServerService,
        private volumeSvc: VolumeService,
        private requestTrackingSvc: RequestTrackingService
        ) {

        this.copyCountList = VolumeHelpers.getCopiesList();
        this.copyCount = VolumeHelpers.getRecomendedCopyCount();
        this.targetSizeUnits = VolumeHelpers.getTargetSizeUnits();
        this.targetSizeUnit = this.targetSizeUnits[0];
        this.tierList = VolumeHelpers.getTierList();
        this.tier = this.tierList[0];
        this.disperseOptions = VolumeHelpers.getDisperseOptions();
        this.disperseOption = this.disperseOptions[0];

        this.clusterSvc.getList().then((clusters) => {
            this.clusters = _.filter(clusters, function(cluster :any) {
                return cluster.cluster_type == 1;
            });

            if (this.clusters.length > 0) {
                this.cluster = this.clusters[0];
                this.calaculateClusterFreeSpace();
            }
        });

    }

    public calaculateClusterFreeSpace(): void {
        this.cluster.capacity = { free: 0, unit: 'GB' };
        this.serverSvc.getListByCluster(this.cluster.cluster_id).then((hosts) => {
            var deviceRequests = [];
            _.each(hosts, (host) => {
                deviceRequests.push(this.serverSvc.getStorageDevicesFree(host.node_id, host.node_name));
            });
            this.$q.all(deviceRequests).then((devicesList) => {
                var capacity = 0;
                _.each(devicesList, (devices) => {
                    var free = _.reduce(devices, (size, device: any) => {
                        return device.size + size;
                    }, 0);
                    capacity = capacity + free;
                });
                this.cluster.capacity = { free: capacity, unit: 'GB' };
            });
        });
    };

    private findStorageDevices(): void {
        this.storageDevices = [];
        this.actualSize = 0;
        this.serverSvc.getListByCluster(this.cluster.cluster_id).then((hosts) => {
            var deviceRequests = [];
            _.each(hosts, (host) => {
                deviceRequests.push(this.serverSvc.getStorageDevicesFree(host.node_id, host.node_name));
            });

            var selectedDevices = [];
            this.$q.all(deviceRequests).then((devicesList) => {
                selectedDevices = VolumeHelpers.getStorageDevicesForVolumeBasic(
                    this.targetSize, this.copyCount, devicesList);
                this.storageDevices = selectedDevices;
                this.actualSize = VolumeHelpers.getVolumeSize(this.storageDevices, this.copyCount);
            });
        });
    }

    private moveStep(nextStep: number): void {
        this.step = this.step + nextStep;
        if (this.step == 3) {
            this.findStorageDevices();
        }
    }

    private isCancelAvailable() {
        return this.step === 1;
    }

    private isSubmitAvailable() {
        return this.step === 3;
    };

    private cancel() {
        this.$location.path('/volumes');
    };

    private submit() {
        var volume = {
            cluster: this.cluster.cluster_id,
            volume_name: this.name,
            volume_type: 2,
            replica_count: this.copyCount,
            bricks: []
        };
        _.each(this.storageDevices, function(device) {
            var brick = {
                node: device.node,
                storage_device: device.storage_device_id
            }
            volume.bricks.push(brick);
        });
        this.$log.debug("Creating volume " + this.name);
        this.volumeSvc.create(volume).then((result) => {
            console.log(result);
            if (result.status === 202) {
                this.requestTrackingSvc.add(result.data, 'Creating volume \'' + volume.volume_name + '\'');
                var modal = ModalHelpers.SuccessfulRequest(this.$modal, {
                    title: 'Create Volume Request is Submitted',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.$location.path('/volumes');
                });
            }
            else {
                this.$log.error('Unexpected response from Volumes.create', result);
            }
        });
    };
}
