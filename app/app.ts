// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {RouteConfig} from "./components/router/route-config";
import {MenuService} from "./components/base/menu-svc";

import {ApplicationController} from "./components/base/application-controller";
import {MenuController} from "./components/base/menu-controller";
import {ClustersController} from "./components/clusters/clusters-controller";
import {ClusterService} from "./components/rest/clusters";
import {UtilService} from "./components/rest/util";
import {RequestService} from "./components/rest/request";
import {UserService} from "./components/rest/user";
import {OSDService} from "./components/rest/osd";

var angular: ng.IAngularStatic = require("angular");
var ngRoute = require("angular-route");
var ngAnimate = require("angular-animate");
var ngCookies = require("angular-cookies");
var ngResource = require("angular-resource");
var ngSanitize = require("angular-sanitize");
var restangular = require("restangular");
var ngStrap = require("angular-strap");
var ngStrapTpl = require("angular-strap-tpl");

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
			'restangular'
		])
			.controller('ApplicationController', ApplicationController)
			.controller('MenuController', MenuController)
			.controller('ClusterController', ClustersController)
			.service('MenuService', MenuService)
			.service('ClusterService', ClusterService)
			.service('UtilService', UtilService)
			.service('RequestService', RequestService)
			.service('UserService', UserService)
			.service('OSDService', OSDService)
			.config(RouteConfig);
		angular.element(document).ready(function() {
			angular.bootstrap(document, ['usm-client']);
		});
	}
}

var app = new USMApp();
app.initialize();
