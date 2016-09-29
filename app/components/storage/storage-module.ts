// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

import {StorageNewController} from './storage-new';
import {ObjectStorageList} from './object/objectstorage-list';
import {ObjectStorageController} from './object/objectstorage-new';
import {BlockDeviceController} from './blockdevice/blockdevice-new';
import {BlockDeviceList} from './blockdevice/blockdevice-list';
import {BlockDeviceItem} from './blockdevice/blockdevice-item';
import {ObjectStorage} from "./object/objectstorage-new-directive";


var angular: ng.IAngularStatic = require('angular');

var moduleName = 'kitoon.storage';

angular.module(moduleName,[])
    .directive('blockDeviceItem', () => new BlockDeviceItem())
    .controller('StorageNewController', StorageNewController)
    .directive('objectStorageList', () => new ObjectStorageList())
    .controller('ObjectStorageController', ObjectStorageController)
    .directive('blockDeviceList', () => new BlockDeviceList())
    .controller('BlockDeviceController', BlockDeviceController)
    .directive('objectStorage', () => new ObjectStorage());

export default moduleName;
