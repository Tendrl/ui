// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {default as RequestsModule} from "./components/requests/module";
import {default as RestModule} from "./components/rest/rest-module";
import {default as HostModule} from "./components/hosts/host-module";
import {RouteConfig} from "./components/router/route-config";
import {MenuService} from "./components/base/menu-svc";
import {LoginController} from "./components/login/login";
import {ApplicationController} from "./components/base/application-controller";
import {MenuController} from "./components/base/menu-controller";
import {FirstController} from "./components/first/first-controller";
import {DashboardController} from "./components/dashboard/dashboard-controller";
import {ClustersController} from "./components/clusters/clusters-controller";
import {ClusterExpandController} from "./components/clusters/cluster-expand";
import {ClusterNewController} from "./components/clusters/cluster-new";
import {ClusterDetailController} from "./components/clusters/cluster-detail";
import {PoolController} from "./components/pools/pools-controller";
import {PoolNewController} from "./components/pools/pool-new";
import {VolumeController} from "./components/volumes/volume-controller";
import {VolumeNewController} from "./components/volumes/volume-new";
import {VolumeExpandController} from "./components/volumes/volume-expand";

var angular: ng.IAngularStatic = require("angular");
var ngRoute = require("angular-route");
var ngAnimate = require("angular-animate");
var ngCookies = require("angular-cookies");
var ngResource = require("angular-resource");
var ngSanitize = require("angular-sanitize");
var restangular = require("restangular");
var ngStrap = require("angular-strap");
var ngStrapTpl = require("angular-strap-tpl");
var idbWrapper = require("idb-wrapper");
var c3 = require("c3");
var d3 = require("d3");
var c3Angular = require("c3-angular");

class USMApp {
    initialize() {
        console.log('Initializing...');
        angular.module('usm-client', [
            'ngAnimate',
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'mgcrea.ngStrap',
            'gridshore.c3js.chart',
            'restangular',
            RequestsModule,
            RestModule,
            HostModule
        ])
            .controller('LoginController', LoginController)
            .controller('ApplicationController', ApplicationController)
            .controller('MenuController', MenuController)
            .controller('FirstController', FirstController)
            .controller('DashboardController', DashboardController)
            .controller('ClusterController', ClustersController)
            .controller('ClusterExpandController', ClusterExpandController)
            .controller('ClusterNewController', ClusterNewController)
            .controller('ClusterDetailController', ClusterDetailController)
            .controller('PoolController', PoolController)
            .controller('PoolNewController', PoolNewController)
            .controller('VolumeController', VolumeController)
            .controller('VolumeNewController', VolumeNewController)
            .controller('VolumeExpandController', VolumeExpandController)
            .service('MenuService', MenuService)
            .run( function($rootScope, $location) {
               $rootScope.$watch(function() {
                  return $location.path();
                },
                function(a){
                  console.log('url has changed: ' + a);
                  $rootScope.currentURI = a;
                  // show loading div, etc...
                });
            })
            .config(RouteConfig)
            .config(['$httpProvider', function($httpProvider) {
                $httpProvider.defaults.xsrfCookieName = 'csrftoken';
                $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
            }])
            .config(['$logProvider', function($logProvider) {
                $logProvider.debugEnabled(true);
            }]);
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['usm-client']);
        });
    }
}

var app = new USMApp();
app.initialize();
