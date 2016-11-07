// <reference path="../../../typings/tsd.d.ts" />

import {Cluster} from '../../rest/clusters';
import {StorageProfile} from '../../rest/storage-profile';
import {BlockDevice} from '../../rest/blockdevice';

import {ClusterService} from '../../rest/clusters';
import {StorageProfileService} from '../../rest/storage-profile';
import {StorageService} from '../../rest/storage';
import {BlockDeviceService} from '../../rest/blockdevice';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {numeral} from '../../base/libs';

export class BlockDeviceController {
    private cluster: Cluster;
    private deviceName: string;
    private devicesToCreate: number = 1;
    private targetSize = { value: 1, unit: 'GB' };
    private sizeUnits = ['GB', 'TB'];
    private existingPools: any[];
    private useExistingPool = true;
    private selectedPool: any;
    private rbdList: any[];
    private summary: boolean = false;
    private devicesSize: number;

    static $inject: Array<string> = [
        '$routeParams',
        '$location',
        '$log',
        '$q',
        '$modal',
        'ClusterService',
        'StorageService',
        'BlockDeviceService',
        'RequestTrackingService',
        'RequestService'
    ];
    constructor(private $routeParams: ng.route.IRouteParamsService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private $modal,
        private clusterSvc: ClusterService,
        private storageSvc: StorageService,
        private blockDeviceSvc: BlockDeviceService,
        private requestTrackingSvc: RequestTrackingService,
        private requestSvc: RequestService) {
        this.devicesSize = 0;
        let clusterId = $routeParams['clusterid'];
        this.clusterSvc.get(clusterId).then(cluster => {
            this.cluster = cluster;
            return this.storageSvc.getListByCluster(this.cluster.clusterid);
        }).then(pools => {
            this.existingPools = [];
            _.each(pools, (pool) => {
                pool.capacity = {
                    total: pool.usage.total,
                    used: pool.usage.used
                };
                pool.utilization = {};
                if(pool.type === 'replicated') {
                    this.existingPools.push(pool);
                }
            });
            if (this.existingPools.length > 0) {
                this.selectedPool = this.existingPools[0];
                this.processUtilization();
                this.useExistingPool = true;
            }
            else {
                this.useExistingPool = false;
            }
        });
        this.rbdList = [];
    }

    public processUtilization() {
        this.devicesSize = numeral().unformat(this.targetSize.value + this.targetSize.unit) * this.devicesToCreate;
        if( this.devicesSize <= this.selectedPool.capacity.total ) {
            var inUsePercent = Math.round((this.selectedPool.capacity.used / this.selectedPool.capacity.total) * 100);
            var toBeUsedPercent = Math.round((this.devicesSize / this.selectedPool.capacity.total) * 100);
            var remainingSize = this.selectedPool.capacity.total - this.selectedPool.capacity.used - this.devicesSize;
            var remainingPercent = 100 - inUsePercent - toBeUsedPercent;
            this.selectedPool.utilization.data = [
                { "used": inUsePercent, "color": "#00a8e1", "subtitle": "" },
                { "used": toBeUsedPercent, "color": "#3F9C35", "subtitle": numeral(this.devicesSize).format('0.0 b') + " to be added" },
                { "used": remainingPercent, "color": "#EDEDED", "subtitle": numeral(remainingSize).format('0.0 b') + " remaining" }
            ]
        }
    }

    public getDeviceNameList(deviceName: string, count: number) {
        var list = [];
        if (deviceName && deviceName.trim().length > 0) {
            for (let index = 1; index <= count; index++) {
                var suffix = count > 1 ? index : '';
                list.push(deviceName + suffix);
            }
        }
        return list;
    }

    public getBlockDeviceNames(deviceName: string, count: number) {
        if (count > 1) {
            return this.getDeviceNameList(deviceName, count).join(', ');
        }
        else {
            return null;
        }
    }

    public prepareSummary(): void {
        var list = this.getDeviceNameList(this.deviceName, this.devicesToCreate);
        _.each(list, device => {
            let rbd = {
                name: device,
                size: this.targetSize
            }
            this.rbdList.push(rbd);
        });
        this.summary = true;
    }

    public removeBlockDevice(deviceName: string): void {
        _.remove(this.rbdList, rbd => rbd.name === deviceName);
    }

    public cancel(): void {
        this.$location.path('/rbds/');
    }

    public submit(): void {
        var list = [];
        _.each(this.rbdList, (rbd) => {
            let blockdevice: BlockDevice = {
                name: rbd.name,
                size: rbd.size.value + rbd.size.unit
            };
            list.push(this.blockDeviceSvc.add(this.cluster.clusterid, this.selectedPool.storageid, blockdevice));
        });
        this.$q.all(list).then((tasks) => {
            for (var task of tasks) {
                this.requestSvc.get(task.data.taskid).then((result) => {
                    this.requestTrackingSvc.add(result.id, result.name);
                });
            }
        });
        var modal = ModalHelpers.SuccessfulRequest(this.$modal, {
            title: 'Add Block Storage Request is Submitted',
            container: '.usmClientApp'
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
            $hide();
            this.$location.path('/rbds/');
        });
    }
}
