/// <reference path="../../../../typings/tsd.d.ts" />

import {StorageProfileDisksController} from './storageprofile-disks-controller';
/*
 * @ngdoc directive
 * @name kitoon.storage:storageprofileDisks
 * @scope
 * @restrict E
 *
 * @param hosts. The disks from the hosts which needs to be shown.
 * @param getHosts function. A function which returns the hosts.
 *
 * @description
 * An AngularJS directive for showing the storage profiles with disks.
 *
 * @example
 * <storageprofile-disks hosts="hosts" get-hosts="vm.getHosts()"></storageprofile-disks>
 *
*/

export class StorageProfileDisks implements ng.IDirective {
    restrict = 'E';
    scope = {
        hosts: '=?hosts',
        hostsCallback: '&?getHosts'
    };
    controller = StorageProfileDisksController;
    controllerAs = 'vm';
    bindToController = true;
    templateUrl = 'views/clusters/storageprofile/storageprofile-disks.html';
}
