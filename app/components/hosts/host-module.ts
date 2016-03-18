// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {HostListController} from './host';
import {HostDetailController} from './host-detail';

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'usm-client.hosts';

angular.module(moduleName, [])
    .controller('HostListController', HostListController)
    .controller('HostDetailController', HostDetailController);
    
export default moduleName;
