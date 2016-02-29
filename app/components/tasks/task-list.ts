// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class TaskListController {
    private list: Array<any>;
    private timer;
    private pageNo = 1;
    private pageSize = 20;
    private totalPages = 1;
    private taskStatus = ['Inprogress', 'Completed', 'Failed'];
    private totalCount = 0;
    private fromDateTimeFilter: string = new Date("0").toISOString();
    private toDateTimeFilter: string = new Date().toISOString();
    private selectedStatus = [];
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
        this.requestSvc.getList(this.pageNo, this.pageSize, this.selectedStatus, this.fromDateTimeFilter, this.toDateTimeFilter).then((data: any) => {
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
            if (task.parentid === '00000000-0000-0000-0000-000000000000') {
                var lastStatus = _.last<any>(task.statuslist);
                if (lastStatus) {
                    task.statusMsg = lastStatus.Message;
                    task.timestamp = lastStatus.Timestamp;
                }
                if ((!task.completed) && task.subtasks.length > 0) {
                    this.requestSvc.get(task.subtasks[0]).then((subtask) => {
                        var lastStatus = _.last<any>(subtask.statuslist);
                        if (lastStatus) {
                            task.statusMsg = lastStatus.Message;
                            task.timestamp = lastStatus.Timestamp;
                        }
                    });
                }
                list.push(task)
            }
        });
        this.list = list.reverse();
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
        this.refresh();
    }

    public resetFilters() {
        this.fromDateTimeFilter = new Date("0").toISOString();
        this.toDateTimeFilter = new Date().toISOString();
        this.selectedStatus = [];
    }

}
