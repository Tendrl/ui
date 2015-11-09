// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class StorageListController {
    private list: Array<any>;
    private timer;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$timeout',
        'UtilService',
        'RequestService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private utilService: UtilService,
        private requestService: RequestService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
    }

    public refresh() {
        this.loadData([]);
    }

    public loadData(storages) {
    }

    public create() {
        this.$location.path('/storages/new');
    }
}
