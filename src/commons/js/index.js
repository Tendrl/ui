//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router"]);

    /* Setting up provider for getting config data */
    storageModule.provider("config", function () {

        var config = {};

        /* Accessible only in config function */
        this.setConfigData = function (dataFromServer) {
            config = dataFromServer;
        };

        /* Accessible in controller/service/factory */
        this.$get = function() { return config; };

    });

    /* First fetch the config data than only application will bootstrap */
    fetchConfigData().then(bootstrapApplication);

    function fetchConfigData() {
        var initInjector = angular.injector(["ng"]);
        
        var $http = initInjector.get("$http");

        return $http.get("../../config.json").then(function(response) {

            storageModule.config(function($stateProvider, $urlRouterProvider, $httpProvider, configProvider) {

                configProvider.setConfigData(response.data);

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

