//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router","ui.bootstrap","gridshore.c3js.chart","patternfly.charts"]);

    /* Setting up provider for getting config data */
    storageModule.provider("config", function () {

        var config = {initData: null, clusterData: null};

        /* Accessible only in config function */
        this.setConfigData = function (initData) {
            config.initData = initData;
        };

        this.setClusterData = function (clusterData) {
            config.clusterData = clusterData;
        };

        /* Accessible in controller/service/factory */
        this.$get = function() { return config; };

    });

    /* First fetch the config data than only application will bootstrap */
    fetchConfigData()
        .then(bootstrapApplication);

    function fetchConfigData() {
        var initInjector = angular.injector(["ng"]);
        
        var $http = initInjector.get("$http");

        return $http.get("../../config.json").then(function(response) {

            storageModule.config(function($stateProvider, $urlRouterProvider, $httpProvider, configProvider) {

                configProvider.setConfigData(response.data);

                $http.get("/api/GetClusterList.json").then(function(response) {
                    configProvider.setClusterData(response.data);
                }, function(errorResponse) {
                    console.log("Error while fetching cluster-list");
                });

                $httpProvider.defaults.headers.post = {};
                $httpProvider.defaults.headers.delete = {};

                $urlRouterProvider.otherwise("/dashboard");

                $stateProvider
                    .state("Tendrl", {
                        url: "/Tendrl",
                        templateUrl: "index.html",
                        abstract: true
                    })
                    .state("dashboard", {
                        url: "/dashboard",
                        template: "<h1>Coming Soon...</h1>"
                    })
                    .state("cluster", {
                        url: "/cluster",
                        templateUrl: "/modules/cluster/cluster-list/cluster-list.html",
                        controller: "clusterController",
                        controllerAs: "clusterCntrl"
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

        }, function(errorResponse) {
            // Handle error case
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ["TendrlModule"]);
        });
    }
}());

