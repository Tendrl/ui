// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

import {StorageListController} from './storage-list';
import {StorageNewController} from './storage-new';
import {ObjectStorageController} from './object/storage-new-object';
import {BlockDeviceController} from './blockdevice/blockdevice-new';

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'kitoon.storage';

angular.module(moduleName, ['rzModule'])
    .controller('StorageListController', StorageListController)
    .controller('StorageNewController', StorageNewController)
    .controller('ObjectStorageController', ObjectStorageController)
    .controller('BlockDeviceController', BlockDeviceController);

export default moduleName;
