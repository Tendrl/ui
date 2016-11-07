// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {EventListController} from './event-list';
import {EventDetailController} from './event-detail-controller'

var angular: ng.IAngularStatic = require('angular');
var angularGrowl = require('angular-growl');

var moduleName = 'kitoon.events';

angular.module(moduleName, ['angular-growl'])
    .controller('EventListController', EventListController)
    .controller('EventDetailController',EventDetailController)
    .config(['growlProvider', function(growlProvider) {
        growlProvider.globalTimeToLive(7000);
        growlProvider.globalDisableCountDown(true);
    }]);

export default moduleName;
