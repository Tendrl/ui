(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("header", {

            templateUrl: "/modules/base/header/header.html",
            controller: headerController,
            controllerAs: "header"
        });

    /*@ngInject*/
    function headerController($rootScope, $state, $scope, $uibModal, AuthManager, utils, Notifications, userStore) {

        var vm = this,
            currentUser;

        vm.showAlerts = false;
        vm.searchBy = {};
        vm.filterBy = "";
        vm.severity = "";

        vm.notificationClose = notificationClose;
        vm.logout = logout;
        vm.homePage = homePage;
        vm.setNotificationFlag = setNotificationFlag;
        vm.goToClusterPage = goToClusterPage;
        vm.getClusterName = getClusterName;
        vm.userSetting = userSetting;
        vm.closeNotificationBar = closeNotificationBar;

        vm.filterBySeverity = filterBySeverity;
        vm.setSeverity = setSeverity;
        vm.clearAllFilters = clearAllFilters;
        vm.toggleNav = toggleNav;
        vm.getUserRole = getUserRole;
        vm.updateViewing = updateViewing;

        $rootScope.notification = Notifications.data;
        vm.htmlContent = true;

        $scope.$on("GotAlertData", function(event, data) {
            if ($rootScope.alertList !== null) {
                vm.alertList = $rootScope.alertList;
                vm.severityList = utils.getAlertSeverityList(vm.alertList);
            }
        });

        init();

        function init() {
            _getUserName();
        }

        function _getUserName() {
            if (!userStore.users.length) {
                userStore.getUserInfo()
                    .then(function(data) {
                        vm.currentUser = data.name;
                    });
            }
        }

        function getUserRole() {
            return AuthManager.getUserRole();
        }

        function toggleNav(event) {
            $rootScope.$emit('toggleNav');
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        function setNotificationFlag() {
            vm.showAlerts = !vm.showAlerts;
        }

        function notificationClose(data) {
            Notifications.remove(data);
        }

        function closeNotificationBar() {
            vm.showAlerts = false;
        }

        function updateViewing (viewing, data) {
            Notifications.setViewing(data, viewing);
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

        function userSetting() {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/base/user-setting/user-setting.html",
                controller: "userSettingController",
                controllerAs: "vm",
                size: "md"
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }

        function homePage() {
            $state.go("clusters");
        }

        function goToClusterPage() {
            if ($rootScope.selectedClusterOption === "allClusters") {
                $state.go("clusters");
            } else {
                $state.go("cluster-hosts", { clusterId: $rootScope.selectedClusterOption });
            }
        }

        function getClusterName(id) {

            if (!id) {
                return "Select a cluster...";
            }

            if (id === "allClusters") {
                return "All Clusters";
            } else {

                var data = $rootScope.clusterData,
                    len = data.length,
                    i;

                for (i = 0; i < len; i++) {
                    if (id === data[i].clusterId) {
                        return data[i].clusterId;
                    }
                }
            }
        }

        function filterBySeverity(list) {
            if (!vm.severity) {
                return list;
            } else if (list.severity.charAt(0) === vm.severity.charAt(0)) {
                return list;
            }
        }

        function setSeverity(value) {
            vm.severity = value;
            vm.filterBy = "severity";
            vm.filterByValue = "Severity";
            vm.searchBy[vm.filterBy] = value;
        }

        function clearAllFilters() {
            vm.searchBy = {};
            vm.filterBy = "";
            vm.severity = "";
        }
    }

})();
