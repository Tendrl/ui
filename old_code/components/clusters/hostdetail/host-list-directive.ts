/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name cluster:HostListDirective
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the list of hosts in cluster.
 *
 * @example
 * <host-list cluster-id="clusterid"></host-list>
 *
*/

import {HostListController} from '../../hosts/host';

export class HostList implements ng.IDirective {
    restrict: string = "E";
    scope = {
        clusterId: '=clusterId'
    };
    controllerAs: string = 'hosts';
    bindToController: boolean = true;
    controller = HostListController;
    templateUrl = 'views/hosts/host-list.html';
}
