// <reference path="../../../typings/tsd.d.ts" />

import {RequestService} from '../rest/request';

export class TaskDetailController {
    private list: Array<any>;
    private timer;
    private taskId: string;
    private detail: any;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$routeParams',
        'RequestService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private requestSvc: RequestService) {
        this.taskId = this.routeParamsSvc['taskId'];
        this.timer = this.$interval(() => this.refresh(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.requestSvc.get(this.taskId).then(task => {
            this.detail = task;
            if(task.completed == true){
                this.$interval.cancel(this.timer);
            }
        });
    }
}
