/// <reference path="../../../../typings/tsd.d.ts" />

import {ObjectStorageListController} from './objectstorage-list-controller';

/*
 * @ngdoc directive
 * @name kitoon.storage:objectstorageList
 * @scope
 * @restrict E
 *
 * @param clusterId. The pools from the cluster which needs to be shown.
 *
 * @description
 * An AngularJS directive for showing list of pools.
 *
 * @example
 * <objectstorage-list cluster-id="clusterId"></objectstorage-list>
 *
*/

export class ObjectStorageList implements ng.IDirective {
    restrict = 'E';
    scope = {
        clusterId: '=clusterId'
    };
    controller = ObjectStorageListController;
    controllerAs = 'storages';
    bindToController = true;
    templateUrl = 'views/storage/object/objectstorage-list.html';
}
