//# sourceURL=storage-management-plugin.js
(function() {
    "use strict";

    var storageModule = angular.module("TendrlModule", ["ui.router"]);

    storageModule.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

        //$locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise("/dashboard");

        $stateProvider
            .state("Tendrl", {
                url: "/Tendrl",
                templateUrl: "index.html",
                abstract: true
            })
            .state("dashboard", {
                url: "/dashboard",
                template: "<h1>Coming soon...</h1>"
            })
            .state("clusters", {
                url: "/clusters",
                templateUrl: "/dist/Tendrl/modules/clusters/clusters.html",
                controller: "clusterController",
                controllerAs: "clusterVm"
            });
    });


}());
