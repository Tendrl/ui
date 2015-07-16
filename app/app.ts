/// <reference path="../typings/tsd.d.ts" />

//import * as clusters from "./components/clusters/clusters-controller";
// var angular = require("angular");
import angular = require("angular");
import clusters = require("./components/clusters/clusters-controller");

class USApp {
	constructor() {

	}
	initialize() {
		console.log('Initializing...');
		angular.module('usm-client', [])
			.controller(clusters.ClustersController);
	}
}

var app = new USApp();
app.initialize();