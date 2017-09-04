(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("header", {

            restrict: "E",
            templateUrl: "/modules/base/header/header.html",
            bindings: {
                isNavigationShow: "="
            },
            controller: headerController,
            controllerAs: "header"
        });

    /*@ngInject*/
    function headerController($rootScope, $state, $scope, AuthManager, utils, Notifications) {

        var vm = this;

        vm.showNotification = false;
        vm.isNotificationExpanded = true;
        vm.notificationClose = notificationClose;
        vm.logout = logout;
        vm.homePage = homePage;
        vm.setNotificationFlag = setNotificationFlag;
        vm.expandNotificationList = expandNotificationList;
        vm.goToClusterPage = goToClusterPage;
        vm.getClusterName = getClusterName;

        $rootScope.notification = Notifications.data;
        $rootScope.selectedClusterOption = "allClusters";

        $scope.$on("GotNoticationData", function(event, data) {
            if ($rootScope.notificationList !== null) {
                vm.notificationList = $rootScope.notificationList;
            }
        });

        function setNotificationFlag() {
            vm.showNotification = !vm.showNotification;
        }

        function expandNotificationList() {
            vm.isNotificationExpanded = !vm.isNotificationExpanded;
        }

        function notificationClose(data) {
            Notifications.remove(data);
        }

        function logout() {
            AuthManager.logout()
                .then(function(data) {
                    AuthManager.setFlags();
                })
                .then(function() {
                    $state.go("login");
                })
                .catch(function(e) {
                    AuthManager.isUserLoggedIn = true;
                    console.log("Logout Error: Logout Not Successful");
                });
        }

        function homePage() {
            $state.go("clusters");
        }

        function goToClusterPage() {
            if ($rootScope.selectedClusterOption === "allClusters") {
                $state.go("clusters");
            } else {
                $state.go("cluster-detail", { clusterId: $rootScope.selectedClusterOption });
            }
        }

        function getClusterName(id) {
            if (id === "allClusters") {
                return "All Clusters";
            } else {

                var data = $rootScope.clusterData,
                    len = data.length,
                    i;

                for (i = 0; i < len; i++) {
                    if (id === data[i].cluster_id) {
                        return data[i].cluster_name;
                    }
                }
            }
        }
    }

})();
