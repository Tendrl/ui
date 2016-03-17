// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class TaskListController {
    private list: Array<any>;
    private timer;
    private pageNo = 1;
    private pageSize = 20;
    private totalPages = 1;
    private searchQuery: string;
    private taskStatus = ['Inprogress', 'Completed', 'Failed'];
    private totalCount = 0;
    private fromDateTimeFilter: string;
    private toDateTimeFilter: string;
    private selectedStatus = [];
    private filterObject = {};
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        'RequestService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private requestSvc: RequestService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.requestSvc.getList(this.pageNo, this.pageSize, this.selectedStatus, this.fromDateTimeFilter, this.toDateTimeFilter, this.searchQuery).then((data: any) => {
            this.totalCount = data.totalcount;
            this.totalPages = Math.ceil(data.totalcount / this.pageSize);
            this.loadData(data.tasks);
        });
    }

    public paginate(pageNo) {
        if (pageNo < 1 || pageNo > this.totalPages)
            return;
        this.pageNo = pageNo;
        this.refresh();
    }

    public loadData(tasks: Array<any>) {
        var list = [];
        _.each(tasks, (task) => {
                var firstStatus = _.first<any>(task.statuslist);
                if (firstStatus) {
                    task.timestamp = firstStatus.Timestamp;
                }
                list.push(task)
        });
        this.list = list;
    }

    public viewDetails(taskId) {
        this.$location.path('/tasks/' + taskId);
    }

    public toggleSelection(status) {
        var idx = this.selectedStatus.indexOf(status);
        if (idx > -1) {
            this.selectedStatus.splice(idx, 1);
        }
        else {
            this.selectedStatus.push(status);
        }
        this.filterObject["status"] = this.selectedStatus;
        this.refresh();
    }

    public applyFilter(key, value) {
        if (value.length === 0) {
            delete this.filterObject[key]
        }
        else {
            this.filterObject[key] = value;
        }
        this.refresh();
    }

    public resetFilters() {
        delete this.filterObject["from"];
        delete this.filterObject["to"];
        delete this.filterObject["search"];
        this.filterObject["status"] = [];
        this.fromDateTimeFilter = this.filterObject["from"];
        this.toDateTimeFilter = this.filterObject["to"];
        this.selectedStatus = this.filterObject["status"];
        this.searchQuery = this.filterObject["search"];
    }

    public clearFilter(key) {
        if (key === "status") {
            this.filterObject[key] = [];
        }
        else {
            delete this.filterObject[key];
        }
        this.fromDateTimeFilter = this.filterObject["from"];
        this.toDateTimeFilter = this.filterObject["to"];
        this.selectedStatus = this.filterObject["status"];
        this.searchQuery = this.filterObject["search"];
    }

}
