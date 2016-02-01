// <reference path="../../../typings/tsd.d.ts" />

import {UtilService} from '../rest/util';
import {EventService} from '../rest/events';
import {RequestService} from '../rest/request';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class EventListController {
    private list: Array<any>;
    private timer;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        '$log',
        '$q',
        'EventService',
        'RequestService',
        'RequestTrackingService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private eventSvc: EventService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.requestSvc.getList().then(tasks => {
            this.loadData(tasks);
        });
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
}
