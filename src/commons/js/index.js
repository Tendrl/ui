//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router", "ui.bootstrap", "frapontillo.bootstrap-switch", "gridshore.c3js.chart", "patternfly.charts", "patternfly.card", "patternfly.form"]);

    /* Setting up provider for getting config data */
    storageModule.provider("config", function() {

        /*Ideally this config should only contain
        configuration related stuff . it should not hold 
        cluster data */
        var config = {};

        /* Accessible only in config function */
        this.setConfigData = function(dataFromServer) {
            config = dataFromServer;
        };

        /* Accessible in controller/service/factory */
        this.$get = function() {
            return config;
        };

    });

    /* First fetch the config data than only application will bootstrap */
    fetchConfigData()
        .then(bootstrapApplication);

    function fetchConfigData() {
        var initInjector = angular.injector(["ng"]);

        var $http = initInjector.get("$http");

        return $http.get("../../config.json").then(function(response) {

            storageModule.config(function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider, configProvider) {

                configProvider.setConfigData(response.data);

                $httpProvider.defaults.headers.post = {};
                $httpProvider.defaults.headers.delete = {};

                $urlRouterProvider.otherwise("/login");

                $stateProvider
                    .state("login", {
                        url: "/login",
                        template: "<login></login>"
                    })
                    .state("cluster", {
                        url: "/clusters",
                        template: "<cluster-list></cluster-list>"
                    })
                    .state("host", {
                        url: "/hosts",
                        template: "<host-list></host-list>"
                    })
                    .state("tasks", {
                        url: "/admin/tasks",
                        template: "<tasks></tasks>"
                    })
                    .state("alerts", {
                        url: "/alerts",
                        template: "<alerts></alerts>"
                    })
                    .state("task-detail", {
                        url: "/admin/tasks/:taskId",
                        template: "<task-detail></task-detail>"
                    });

            });
            storageModule.run(function($rootScope, $location, $http, $interval, menuService, AuthManager, utils, eventStore, config) {
                var restrictedPage, loggedIn, notificationTimer;

                $rootScope.$on("$locationChangeStart", function(event, current, next) {
                    // redirect to login page if not logged in and trying to access a restricted page
                    $rootScope.isHeaderShow = true;

                    restrictedPage = $.inArray($location.path(), ["/login"]) === -1;
                    loggedIn = JSON.parse(localStorage.getItem("userInfo"));
                    if (restrictedPage && !loggedIn) {
                        $location.path("/login");
                    }
                    if (!restrictedPage) {
                        $rootScope.isHeaderShow = false;
                    }
                });

                $rootScope.$on("$stateChangeSuccess", function(event, current, prev) {
                    menuService.setActive(current.name);
                });

                if (JSON.parse(localStorage.getItem("userInfo")) && JSON.parse(localStorage.getItem("userInfo")).username && JSON.parse(localStorage.getItem("userInfo")).accessToken) {
                    AuthManager.isUserLoggedIn = true;
                    AuthManager.setAuthHeader();
                }

                if (AuthManager.isUserLoggedIn) {
                    /* Tracking the current URI for navigation*/
                    $rootScope.isAPINotFoundError = false;
                    $rootScope.clusterData = null;
                    $rootScope.notificationList = null;

                    var url = $location.path();
                    utils.getObjectList("Cluster").then(function(list) {
                        $rootScope.clusterData = list;
                        /* Setting up manual broadcast event for ClusterData*/
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        if ($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0) {
                            /* Forward to cluster view if we have cluster data. */
                            getNotificationList();
                        }
                    }).catch(function(error) {
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        $rootScope.isAPINotFoundError = true;
                    }).finally(function() {
                        $rootScope.isNavigationShow = true;
                    });
                }

                function getNotificationList() {
                    eventStore.getNotificationList()
                        .then(function(notificationList) {
                            $interval.cancel(notificationTimer);
                            $rootScope.notificationList = notificationList;
                            $rootScope.$broadcast("GotNoticationData", $rootScope.notificationList);
                            startNotificationTimer();
                        })
                        .catch(function(error) {
                            $rootScope.notificationList = null;
                        });
                }

                function startNotificationTimer() {
                    notificationTimer = $interval(function() {
                        getNotificationList();
                    }, 1000 * config.eventsRefreshIntervalTime, 1);
                }

                $rootScope.$on("$destroy", function() {
                    $interval.cancel(notificationTimer);
                });

                $rootScope.$on("UserLogsOut", function() {
                    $interval.cancel(notificationTimer);
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
