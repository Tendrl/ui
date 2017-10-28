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

        vm.showNotification = false;
        vm.notificationClose = notificationClose;
        vm.logout = logout;
        vm.homePage = homePage;
        vm.setNotificationFlag = setNotificationFlag;
        vm.goToClusterPage = goToClusterPage;
        vm.getClusterName = getClusterName;
        vm.userSetting = userSetting;
        vm.closeNotificationBar = closeNotificationBar;
        vm.toggleNav = toggleNav;
        vm.getUserRole = getUserRole;

        $rootScope.notification = Notifications.data;

        $scope.$on("GotNoticationData", function(event, data) {
            if ($rootScope.notificationList !== null) {
                vm.notificationList = $rootScope.notificationList;
            }
        });

        init();

        function init(){
            _getUserName();
        }

        function _getUserName(){
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

        function toggleNav(event){
            $rootScope.$emit('toggleNav');
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        function setNotificationFlag() {
            vm.showNotification = !vm.showNotification;
        }

        function notificationClose(data) {
            Notifications.remove(data);
        }

        function closeNotificationBar() {
            vm.showNotification = false;
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
                    if (id === data[i].cluster_id) {
                        return data[i].cluster_id;
                    }
                }
            }
        }
    }

})();