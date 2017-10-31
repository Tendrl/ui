//# sourceURL=storage-management-plugin.js
(function() {

    var storageModule = angular.module("TendrlModule", ["ui.router", "ui.bootstrap", "frapontillo.bootstrap-switch", "gridshore.c3js.chart", "patternfly.charts", "patternfly.card", "patternfly.form", "patternfly.notification"]);

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
                    .state("clusters", {
                        url: "/clusters",
                        template: "<cluster-list></cluster-list>"
                    })
                    .state("import-cluster", {
                        url: "/import-cluster/:clusterId",
                        template: "<import-cluster cluster='clusterTobeImported'></import-cluster>"
                    })
                    .state("cluster-detail", {
                        url: "/cluster-detail/:clusterId",
                        template: "<cluster-detail></cluster-detail>"
                    })
                    .state("cluster-hosts", {
                        url: "/cluster-hosts/:clusterId",
                        template: "<cluster-hosts></cluster-hosts>"
                    })
                    .state("cluster-volumes", {
                        url: "/cluster-volumes/:clusterId",
                        template: "<cluster-volumes></cluster-volumes>"
                    })
                    .state("cluster-events", {
                        url: "/cluster-events/:clusterId",
                        template: "<cluster-events></cluster-events>"
                    })
                    .state("hosts", {
                        url: "/hosts",
                        template: "<host-list></host-list>"
                    })
                    .state("host-detail", {
                        url: "/cluster-detail/:clusterId/host-detail/:hostId",
                        template: "<host-detail></host-detail>"
                    })
                    .state("volume-detail", {
                        url: "/cluster-detail/:clusterId/volume-detail/:volumeId",
                        template: "<volume-detail></volume-detail>"
                    })
                    .state("tasks", {
                        url: "/tasks/:clusterId",
                        template: "<tasks></tasks>"
                    })
                    .state("users", {
                        url: "/admin/users",
                        template: "<users></users>"
                    })
                    .state("add-user", {
                        url: "/admin/users/add",
                        template: "<add-user></add-user>"
                    })
                    .state("edit-user", {
                        url: "/admin/users/edit/:userId",
                        template: "<edit-user></edit-user>"
                    })
                    .state("alerts", {
                        url: "/alerts/:clusterId",
                        template: "<alerts></alerts>"
                    })
                    .state("task-detail", {
                        url: "/admin/tasks/:taskId",
                        template: "<task-detail></task-detail>"
                    })
                    .state("forbidden", {
                        url: "/forbidden",
                        template: "<div class='un-auth-user'>You are not authorised to see this view.<div>"
                    });

            });
            storageModule.run(function($rootScope, $location, $http, $interval, menuService, AuthManager, utils, eventStore, config, clusterStore, userStore) {
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

                $rootScope.$on("$stateChangeStart", function(event, next, current) {
                    if (AuthManager.isAuthenticated(next.name)) {
                        $location.path("/forbidden");
                    }
                });

                if (JSON.parse(localStorage.getItem("userInfo")) && JSON.parse(localStorage.getItem("userInfo")).username && JSON.parse(localStorage.getItem("userInfo")).accessToken) {
                    AuthManager.isUserLoggedIn = true;
                    AuthManager.setAuthHeader();
                    $rootScope.userRole = AuthManager.getUserRole();
                }

                $rootScope.forceHideNav = function() {
                    return !$rootScope.selectedClusterOption
                        || $rootScope.selectedClusterOption === "allClusters"
                        || !AuthManager.isUserLoggedIn;
                }

                if (AuthManager.isUserLoggedIn) {
                    /* Tracking the current URI for navigation*/
                    $rootScope.isAPINotFoundError = false;
                    $rootScope.clusterData = null;
                    $rootScope.notificationList = null;
                    $rootScope.selectedClusterOption = null;
                    menuService.setMenus();

                    var url = $location.path();
                    clusterStore.getClusterList().then(function(list) {
                        $rootScope.clusterData = list;
                        /* Setting up manual broadcast event for ClusterData*/
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        if ($rootScope.clusterData !== null && $rootScope.clusterData.length !== 0) {
                            /* Forward to cluster view if we have cluster data. */
                            getNotificationList();
                        }
                    }).catch(function(error) {
                        $rootScope.$broadcast("GotClusterData", $rootScope.clusterData); // going down!
                        $rootScope.isAPINotFoundError = true;
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