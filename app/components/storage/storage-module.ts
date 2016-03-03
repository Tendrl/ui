// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

import {StorageNewController} from './storage-new';
import {ObjectStorageListController} from './object/objectstorage-list';
import {ObjectStorageController} from './object/objectstorage-new';
import {BlockDeviceController} from './blockdevice/blockdevice-new';
import {BlockDeviceListController} from './blockdevice/blockdevice-list';
import {BlockDeviceItem} from './blockdevice/blockdevice-item';

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'kitoon.storage';

angular.module(moduleName, ['rzModule'])
    .directive('blockDeviceItem', () => new BlockDeviceItem())
    .controller('StorageNewController', StorageNewController)
    .controller('ObjectStorageListController', ObjectStorageListController)
    .controller('ObjectStorageController', ObjectStorageController)
    .controller('BlockDeviceListController', BlockDeviceListController)
    .controller('BlockDeviceController', BlockDeviceController);

export default moduleName;
