/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name host:host-overview
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the overview of host.
 *
 * @example
 * <host-overview host-id="hostdetail.id"></host-overview>
 *
*/

import {HostOverviewController} from './host-overview';

export class HostOverview implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=hostId'
    };
    controllerAs: string = 'hostoverview';
    bindToController: boolean = true;
    controller = HostOverviewController;
    templateUrl = 'views/hosts/host-overview/host-overview.html';
}
