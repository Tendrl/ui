// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {ClusterService} from './clusters';
import {StorageService} from './storage';
import {OSDService} from './osd';
import {PoolService} from './pool';
import {RequestService} from './request';
import {ServerService} from './server';
import {UserService} from './user';
import {UtilService} from './util';
import {VolumeService} from './volume';
import {EventService} from './events';

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'kitoon.rest';

angular.module(moduleName, ['angular-growl'])
    .service('ClusterService', ClusterService)
    .service('StorageService', StorageService)
    .service('OSDService', OSDService)
    .service('PoolService', PoolService)
    .service('RequestService', RequestService)
    .service('ServerService', ServerService)
    .service('UserService', UserService)
    .service('UtilService', UtilService)
    .service('VolumeService', VolumeService)
    .service('EventService', EventService);

export default moduleName;
