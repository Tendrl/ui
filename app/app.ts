// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {default as RequestsModule} from "./components/requests/module";
import {default as RestModule} from "./components/rest/rest-module";

import {RouteConfig} from "./components/router/route-config";
import {MenuService} from "./components/base/menu-svc";

import {ApplicationController} from "./components/base/application-controller";
import {MenuController} from "./components/base/menu-controller";
import {FirstController} from "./components/first/first-controller";
import {ClustersController} from "./components/clusters/clusters-controller";
import {PoolController} from "./components/pools/pools-controller";
import {PoolNewController} from "./components/pools/pool-new";
import {HostController} from "./components/hosts/host";
import {VolumeController} from "./components/volumes/volume-controller";
import {HostDetailController} from "./components/hosts/host-detail";

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
    constructor() {

    }
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
            RestModule
        ])
            .controller('ApplicationController', ApplicationController)
            .controller('MenuController', MenuController)
            .controller('FirstController', FirstController)
            .controller('ClusterController', ClustersController)
            .controller('PoolController', PoolController)
            .controller('PoolNewController', PoolNewController)
            .controller('HostController', HostController)
            .controller('HostDetailController', HostDetailController)
            .controller('VolumeController', VolumeController)
            .service('MenuService', MenuService)
            .config(RouteConfig);
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['usm-client']);
        });
    }
}

var app = new USMApp();
app.initialize();
