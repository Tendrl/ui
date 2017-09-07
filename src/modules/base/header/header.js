(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("header", {

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

        $rootScope.notification = Notifications.data;

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

        function userSetting(username) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/users/deleteUser/deleteUser.html",
                controller: "deleteUserController",
                controllerAs: "vm",
                size: "md",
                resolve: {
                    selectedUser: function() {
                        return username;
                    }
                }
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
    }

})();