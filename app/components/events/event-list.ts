// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {EventService} from '../rest/events';

export class EventListController {
    private list: Array<any>;
    private timer;
    private pageNo = 1;
    private pageSize = 10;
    private totalPages = 1;
    private totalCount = 0;
    private fromDateTimeFilter: string = new Date("0").toISOString();
    private toDateTimeFilter: string = new Date().toISOString();
    private alarmStatus = ["indeterminate",
        "critical",
        "major",
        "minor",
        "warning",
        "cleared"];
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        'EventService',
        'RequestService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private eventSvc: EventService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.eventSvc.getList(this.pageNo, this.pageSize, this.fromDateTimeFilter, this.toDateTimeFilter).then((data: any) => {
            this.totalCount = data.totalcount;
            this.totalPages = Math.ceil(data.totalcount / this.pageSize);
            this.list = data.events;
        });
    }

    public paginate(pageNo) {
        if (pageNo < 1 || pageNo > this.totalPages)
            return;
        this.pageNo = pageNo;
        this.refresh();
    }

    public viewDetails(eventId) {
        this.$location.path('/events/' + eventId);
    }

    public resetFilters() {
        this.fromDateTimeFilter = new Date("0").toISOString();
        this.toDateTimeFilter = new Date().toISOString();
        this.refresh();
    }
}
