/// <reference path="../../../../typings/tsd.d.ts" />

import {BlockDeviceListController} from './blockdevice-list-controller';

/*
 * @ngdoc directive
 * @name kitoon.storage:blockDeviceList
 * @scope
 * @restrict E
 *
 * @param clusterId. The rbds from the cluster which needs to be shown. If clusterId is not provided, rbds from all the clusters will be shown
 *
 * @description
 * An AngularJS directive for showing list of rbds.
 *
 * @example
 * <block-device-list cluster-id="clusterId"></block-device-list>
 *
*/

export class BlockDeviceList implements ng.IDirective {
    restrict = 'E';
    scope = {
        clusterId: '=clusterId'
    };
    controller = BlockDeviceListController;
    controllerAs = 'rbds';
    bindToController = true;
    templateUrl = 'views/storage/blockdevice/blockdevice-list.html';
}
