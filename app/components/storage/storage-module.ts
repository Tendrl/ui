// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

import {StorageListController} from './storage-list';
import {StorageNewController} from './storage-new';
import {OpenStackStorageController} from './storage-new-openstack';
import {ObjectStorageController} from './object/storage-new-object';

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'kitoon.storage';

angular.module(moduleName, [])
    .controller('StorageListController', StorageListController)
    .controller('StorageNewController', StorageNewController)
    .controller('ObjectStorageController', ObjectStorageController)
    .controller('OpenStackStorageController', OpenStackStorageController);

export default moduleName;
