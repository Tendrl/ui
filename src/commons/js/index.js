//# sourceURL=storage-management-plugin.js
(function() {
    "use strict";

    var storageModule = angular.module("TendrlModule", ["ui.router"]);

    storageModule.constant("config", {
            baseUrl: "/1.0/",
            requestHeader: {"Content-Type": "application/x-www-form-urlencoded"}
        }
    );

    storageModule.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

        //$locationProvider.html5Mode(true);

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

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
            .state("cluster", {
                url: "/cluster",
                templateUrl: "/modules/cluster/cluster.html",
                controller: "clusterController",
                controllerAs: "cluster"
            })
            .state("import-cluster", {
                url: "/import-cluster",
                templateUrl: "/modules/cluster/import-cluster/import-cluster.html",
                controller: "importClusterController",
                controllerAs: "importCluster"
            })
            .state("cluster-detail", {
                url: "/cluster/:clusterId",
                templateUrl: "/modules/cluster/cluster-detail/cluster-detail.html",
                controller: "clusterDetailController",
                controllerAs: "clusterDetail"
            })
            .state("node", {
                url: "/node",
                templateUrl: "/modules/node/node.html",
                controller: "nodeController",
                controllerAs: "node"
            });

    });


}());
