// <reference path="../../../typings/tsd.d.ts" />

import {EventService} from '../rest/events';

export class EventDetailController {
    private timer;
    private eventId: string;
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
        private eventSvc: EventService) {
        this.eventId = this.routeParamsSvc['eventId'];
        this.timer = this.$interval(() => this.refresh(), 15000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.refresh();
    }

    public refresh() {
        this.eventSvc.get(this.eventId).then(event => {
            this.detail = event;
        });
    }
}
