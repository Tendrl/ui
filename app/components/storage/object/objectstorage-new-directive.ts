// <reference path="../../../typings/tsd.d.ts" />

/**
 * @ngdoc directive
 * @name kitoon.storage.object.objectstorage-new
 * @scope
 * $restrict E
 *
 * @description
 * An AngularJS Directive for rbd along with pool creation
 *
 * @example
 * <object-storage pool-with-rbd="boolean" prepare-rbd-summary="blockdevice.prepareSummary()" rbd-list="blockdevice.rbdlist[]" pool-name="blockdevice.name"></object-storage>
 * pool-with-rbd    -> boolean to decide simple pool creation or creation with RBD
 * prepare-rbd-summary -> the method used to generate list of RBDs
 * rbd-list -> a shared list of rbds
 */

import {ObjectStorageController} from "./objectstorage-new";

export class ObjectStorage implements ng.IDirective {
    scope= {
        poolWithRbd: "@",
        prepareRbdSummary: "&",
        rbdList: "=",
        poolName: "="
    };
    restrict = 'E';
    controller = ObjectStorageController;
    controllerAs = 'storage';
    bindToController = true;
    templateUrl = 'views/storage/object/objectstorage-new-directive.html';
}