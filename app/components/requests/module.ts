// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {RequestTrackingService} from './request-tracking-svc';
import {RequestsController} from './requests-controller';

var angular: ng.IAngularStatic = require('angular');
var angularGrowl = require('angular-growl');

var moduleName = 'usm-client.requests';

angular.module(moduleName, ['angular-growl'])
    .service('RequestTrackingService', RequestTrackingService)
    .controller('RequestsController', RequestsController);
    
export default moduleName;
