// <reference path="../../../typings/tsd.d.ts" />

import {BlockDeviceService} from '../../rest/blockdevice';
import {numeral} from '../../base/libs';

export class BlockDeviceListController {
    private list: Array<any>;
    private clusterMap = {};
    private timer;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        'BlockDeviceService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private blockDeviceSvc: BlockDeviceService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.blockDeviceSvc.getList().then(blockdevices => {
            this.loadData(blockdevices);
        });
    }

    public loadData(blockdevices) {
        this.list = blockdevices;
    }

    public getFormatedSize(size: number): string {
        return numeral(size).format('0 b');
    }

    public create() {
        this.$location.path('/storage/new');
    }

    public remove(rbd) {
    }
}
