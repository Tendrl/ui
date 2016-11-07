/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name host:hostConfig
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the configuration of host.
 *
 * @example
 * <host-config host-id="hostid"></host-config>
 *
*/

import {HostConfigController} from './host-config';

export class HostConfig implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=hostId'
    };
    controllerAs: string = 'hostconfig';
    bindToController: boolean = true;
    controller = HostConfigController;
    templateUrl = 'views/hosts/host-config/host-config.html';
}
