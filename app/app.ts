// <reference path="../typings/tsd.d.ts" />
declare function require(name:string);

import {ClustersController} from "./components/clusters/clusters-controller";
import {ClusterService} from "./components/rest/clusters";

var angular = require("angular");
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
			'ngSanitaize',
			'ngRoute',
			'mgcrea.ngStrap'
		])
			.controller('ClusterController', ClustersController)
			.service('ClusterService', ClusterService);
	}
}

var app = new USMApp();
app.initialize();
