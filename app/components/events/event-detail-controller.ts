// <reference path="../../../typings/tsd.d.ts" />

import {EventService} from '../rest/events';

export class EventDetailController {
    private eventId: string;
    private detail: any;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$routeParams',
        'EventService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private eventSvc: EventService) {
        this.eventId = this.routeParamsSvc['eventId'];
        this.refresh();
    }

    public refresh() {
        this.eventSvc.get(this.eventId).then(event => {
            this.detail = event;
        });
    }
}
