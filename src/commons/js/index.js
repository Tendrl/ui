//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router","ui.bootstrap","gridshore.c3js.chart","patternfly.charts"]);

    /* Setting up provider for getting config data */
    storageModule.provider("config", function () {

        /*Ideally this config should only contain
        configuration related stuff . it should not hold 
        cluster data */
        var config = {};

        /* Accessible only in config function */
        this.setConfigData = function (dataFromServer) {
            config = dataFromServer;
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

                $httpProvider.defaults.headers.post = {};
                $httpProvider.defaults.headers.delete = {};

                $urlRouterProvider.otherwise("/landing-page");

                $stateProvider
                    .state("landing-page", { /* This will decide which view will be landing page */
                        url: "/landing-page",
                        template: "<div class='centerLoading'><div>",
                        resolve: {
                            "landingPage": function($rootScope, $state, utils){  
                                $rootScope.clusterData = null;
                                utils.getObjectList("Cluster").then(function(list) {
                                    $rootScope.clusterData = list;
                                    if($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0){
                                        /* Forward to cluster view if we have cluster data. */
                                        $rootScope.isNavigationShow = true;
                                        $state.go("cluster");
                                    }else{
                                        /* Forward to home view if we don't have cluster data. */
                                        $rootScope.isNavigationShow = false;
                                        $state.go("home");
                                    }
                                });
                            }
                        }
                    })
                    .state("home", {
                        url: "/home",
                        templateUrl: "/modules/home/home.html",
                        controller: "homeController",
                        controllerAs: "homeCntrl"
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
                        controllerAs: "importClusterCntrl"
                    })
                    .state("cluster-detail", {
                        url: "/cluster/:clusterId",
                        templateUrl: "/modules/cluster/cluster-detail/cluster-detail.html",
                        controller: "clusterDetailController",
                        controllerAs: "clusterDetail"
                    })
                    .state("host", {
                        url: "/host",
                        templateUrl: "/modules/host/host-list/host-list.html",
                        controller: "hostController",
                        controllerAs: "hostCntrl"
                    })
                    .state("file-share", {
                        url: "/file-share",
                        templateUrl: "/modules/file-share/file-share-list/file-share-list.html",
                        controller: "fileShareController",
                        controllerAs: "fileShareCntrl"
                    })
                    .state("pool", {
                        url: "/pool",
                        templateUrl: "/modules/pool/pool-list/pool-list.html",
                        controller: "poolController",
                        controllerAs: "poolCntrl"
                    })
                    .state("rbd", {
                        url: "/rbd",
                        templateUrl: "/modules/rbd/rbd-list/rbd-list.html",
                        controller: "rbdController",
                        controllerAs: "rbdCntrl"
                    })
                    .state("add-inventory", {
                        url: "/add-inventory/:clusterId",
                        templateUrl: "/modules/add-inventory/add-inventory.html",
                        controller: "addInventoryController",
                        controllerAs: "addInventoryCntrl"
                    })
                    .state("task", {
                        url: "/admin/task",
                        templateUrl: "/modules/task/task.html",
                        controller: "taskController",
                        controllerAs: "taskCntrl"
                    });

            });

            storageModule.run(function(utils, $rootScope, menuService) {
                /* Tracking the current URI for navigation*/
                $rootScope.$on("$stateChangeSuccess", function(event, current, prev) {
                    menuService.setActive(current.name);
                });

                $rootScope.clusterData = null;
                utils.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    /* Setting up manual broadcast event for ClusterData*/
                    $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                    if($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0) {
                        /* Forward to cluster view if we have cluster data. */
                        $rootScope.isNavigationShow = true;
                    } else {
                        /* Forward to home view if we don't have cluster data. */
                        $rootScope.isNavigationShow = false;
                    }
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

