// <reference path="../../../typings/tsd.d.ts" />

import {EventService} from '../rest/events';

export class EventDetailController {
    private eventId: string;
    private detail: any;
    private dismissMessage: string;
    private errorMessage: string;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$routeParams',
        'EventService',
        'growl'
    ];
    constructor(
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private eventSvc: EventService,
        private growl: any) {
        this.eventId = this.routeParamsSvc['eventId'];
        this.refresh();
    }

    public refresh() {
        this.eventSvc.get(this.eventId).then(event => {
            this.detail = event;
        });
    }

    public dismiss() {
        this.eventSvc.dismiss(this.eventId, this.dismissMessage).then(status => {
            this.growl.success("Event Dismissed");
            this.refresh();
        }).catch(status => {
            this.errorMessage = status.data;
            this.growl.error(status.data);
        });
    }
}
