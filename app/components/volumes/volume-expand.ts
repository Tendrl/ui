/// <reference path="../../../typings/tsd.d.ts" />

declare var require: any;
var numeral = require("numeral");

import {VolumeService} from '../rest/volume';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {VolumeHelpers} from './volume-helpers';
import * as ModalHelpers from '../modal/modal-helpers';
import {RequestTrackingService} from '../requests/request-tracking-svc';

import {Tier, SizeUnit, DisperseOption} from './volume-models';

export class VolumeExpandController {
    private step = 1;
    private name: string;
    private volumeId: string;
    private cluster: any;
    private cluster_name: string;
    private status: string;
    private copyCountList: Array<number>;
    private copyCount: number;
    private targetSizeUnits: Array<SizeUnit>;
    private targetSizeUnit: SizeUnit;
    private tierList: Array<Tier>;
    private tier: Tier;
    private targetSize: string;
    private actualSize = 0;
    private capacity: { free?: number, total: number, used: number, unit: string, percentage?: number, totalFormatted?: string, usedFormatted?: string };
    private newcapacity: { free?: number, total: number, used: number, unit: string, percentage?: number, totalFormatted?: string, usedFormatted?: string };
    private storageDevices: Array<any> = [];
    static $inject: Array<string> = [
        '$q',
        '$log',
        '$location',
        '$routeParams',
        '$modal',
        'ClusterService',
        'ServerService',
        'VolumeService',
        'RequestTrackingService'];
    constructor(
        private $q: ng.IQService,
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $routeParams: ng.route.IRouteParamsService,
        private $modal: any,
        private clusterSvc: ClusterService,
        private serverSvc: ServerService,
        private volumeSvc: VolumeService,
        private requestTrackingSvc: RequestTrackingService
        ) {
        this.volumeId = $routeParams['id'];
        this.copyCountList = VolumeHelpers.getCopiesList();
        this.targetSizeUnits = VolumeHelpers.getTargetSizeUnits();
        this.targetSizeUnit = this.targetSizeUnits[0];
        this.tierList = VolumeHelpers.getTierList();
        this.tier = this.tierList[0];
        this.initialize();
    }

    private initialize() {
        //Initialize the data
        var promises = [this.volumeSvc.get(this.volumeId), this.volumeSvc.getCapacity(this.volumeId)];

        this.$q.all(promises).then((results) => {
            var volume = results[0];
            this.name = volume.volume_name;
            this.copyCount = volume.replica_count;
            this.cluster = volume.cluster;
            this.cluster_name = volume.cluster_name;
            this.status = volume.status;

            var capacity = results[1];
            this.capacity = {
                free: capacity.free / 1073741824,
                total: capacity.total / 1073741824,
                used: capacity.total - capacity.free,
                unit: 'GB'
            };
            this.capacity.used = this.capacity.total - this.capacity.free;
            var percentage = (this.capacity.used * 100) / this.capacity.total;
            this.capacity.percentage = Math.round(percentage);
            this.capacity.totalFormatted = numeral(capacity.total).format('0 b');
            this.capacity.usedFormatted = numeral(capacity.total - capacity.free).format('0 b');

            this.newcapacity = {
                free: this.capacity.free,
                used: this.capacity.used,
                total: this.capacity.total,
                unit: this.capacity.unit,
                percentage: this.capacity.percentage,
                usedFormatted: this.capacity.usedFormatted,
                totalFormatted: this.capacity.totalFormatted
            };
        });
    }

    private calculateCapacity(): void {
        var targetSize = this.targetSize.length > 0 ? parseInt(this.targetSize) : 0;
        this.newcapacity.total = this.capacity.total + targetSize;
        var percentage = (this.newcapacity.used * 100) / this.newcapacity.total;
        this.newcapacity.percentage = Math.round(percentage);
        this.newcapacity.totalFormatted = numeral(this.newcapacity.total * 1073741824).format('0 b');
    }

    public getCapacityProgressColor(percentage): string {
        if (percentage >= 85) {
            return "red";
        }
        else if (percentage >= 70) {
            return "orange";
        }
        else {
            return "green";
        }
    }

    private findStorageDevices(): void {
        this.storageDevices = [];
        this.actualSize = 0;
        this.serverSvc.getListByCluster(this.cluster).then((hosts) => {
            var deviceRequests = [];
            _.each(hosts, (host) => {
                deviceRequests.push(this.serverSvc.getStorageDevicesFree(host.node_id, host.node_name));
            });

            var selectedDevices = [];
            this.$q.all(deviceRequests).then((devicesList) => {
                selectedDevices = VolumeHelpers.getStorageDervicesForVolumeBasic(
                    this.targetSize, this.copyCount, devicesList);
                this.storageDevices = selectedDevices;
                this.actualSize = VolumeHelpers.getVolumeSize(
                    this.storageDevices, this.copyCount);
            });
        });
    }

    public moveStep(nextStep) {
        this.step = this.step + nextStep;
        if (this.step === 2) {
            this.findStorageDevices();
        }
    }

    public isCancelAvailable() {
        return this.step === 1;
    };

    public isSubmitAvailable() {
        return this.step === 2;
    };

    public cancel() {
        this.$location.path('/volumes');
    };

    public submit() {
        var volume = {
            volume: this.volumeId,
            bricks: []
        };
        _.each(this.storageDevices, (device) => {
            var brick = {
                node: device.node,
                storage_device: device.storage_device_id
            }
            volume.bricks.push(brick);
        });
        console.log(volume);
        this.volumeSvc.expand(volume).then((result) => {
            console.log(result);
            if (result.status === 202) {
                this.requestTrackingSvc.add(result.data, 'Expanding volume \'' + this.name + '\'');
                var modal = ModalHelpers.SuccessfulRequest(this.$modal, {
                    title: 'Expand Volume Request is Submitted',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.$location.path('/volumes');
                });
            }
            else {
                this.$log.error('Unexpected response from Volumes.expand', result);
            }
        });
    }
}
