// <reference path="../../../../typings/tsd.d.ts" />

import {BlockDeviceService} from '../../rest/blockdevice';
import {BlockDevice} from '../../rest/blockdevice';
import {ClusterService} from '../../rest/clusters';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import {numeral} from '../../base/libs';
import * as ModalHelpers from '../../modal/modal-helpers';
import {StorageSize} from '../../shared/types/storage.ts';

export class BlockDeviceListController {
    private clusterId: string;
    private list: BlockDevice[] = [];
    private timer;
    private clusters;
    private sizeUnits = ['GB', 'TB'];
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$modal',
        'ClusterService',
        'BlockDeviceService',
        'RequestService',
        'RequestTrackingService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $modal,
        private clusterSvc: ClusterService,
        private blockDeviceSvc: BlockDeviceService,
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
            this.blockDeviceSvc.getListByCluster(this.clusterId).then(blockdevices => {
                this.loadData(blockdevices);
            });
        }
        else {
            this.blockDeviceSvc.getList().then(blockdevices => {
                this.loadData(blockdevices);
            });
        }
    }

    public loadData(blockdevices: BlockDevice[]) {
        _.each(this.list, (blockdevice) => {
            blockdevice['updated'] = false;
        });
        _.each(blockdevices, (blockdevice: BlockDevice) => {
            var item = _.find(this.list, item => item.id === blockdevice.id);
            if (item) {
                item.size = blockdevice.size;
                item['updated'] = true;
            }
            else {
                blockdevice['updated'] = true;
                this.list.push(blockdevice);
            }
        });
        _.remove(this.list, blockdevice => !blockdevice['updated']);
    }

    public getFormatedSize(size: number): string {
        return numeral(size).format('0 b');
    }

    public create() {
        this.$location.path('/storage/new');
    }

    public showResizeForm(rbd: BlockDevice) {
        rbd['resize'] = true;
        var sizeValue = rbd.size.substring(0, rbd.size.length - 2);
        var sizeUnit = rbd.size.substring(rbd.size.length - 2);
        var size = { value: parseInt(sizeValue), unit: sizeUnit };
        rbd['targetSize'] = size;
    }

    public updateSize(rbd: BlockDevice, newSize: StorageSize) {
        rbd['targetSize'] = newSize;
    }

    public resize(rbd: BlockDevice) {
        var targetSize = rbd['targetSize'];
        var size = { size: targetSize.value.toString() + targetSize.unit };
        this.blockDeviceSvc.resize(rbd.clusterid, rbd.storageid, rbd.id, size).then((task) => {
            this.requestSvc.get(task.data.taskid).then((result) => {
                this.requestTrackingSvc.add(result.id, result.name);
            });
        });
        rbd['resize'] = false;
    }

    public cancelResize(rbd: BlockDevice) {
        rbd['resize'] = false;
    }

    public remove(rbd: BlockDevice) {
        var modal = ModalHelpers.RemoveConfirmation(this.$modal, {
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
            if (confirmed) {
                this.blockDeviceSvc.remove(rbd.clusterid, rbd.storageid, rbd.id).then((task) => {
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
