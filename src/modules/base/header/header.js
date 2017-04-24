(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("headerController", headerController);

    /*@ngInject*/
    function headerController($rootScope, $state, $scope, AuthManager, utils) {

        var vm = this;

        vm.showNotification = false;
        vm.isNotificationExpanded = true;
        vm.notificationClose = notificationClose;
        vm.logout = logout;
        vm.homePage = homePage;
        vm.setNotificationFlag = setNotificationFlag;
        vm.expandNotificationList = expandNotificationList;

        $rootScope.notification = {
            "type": "",
            "message": ""
        };

        $scope.$on("GotNoticationData", function(event, data) {
            if ($rootScope.notificationList !== null && $rootScope.notificationList.length !== 0) {
               vm.notificationList = $rootScope.notificationList;
            }
        });

        function setNotificationFlag() {
            vm.showNotification = !vm.showNotification;
        }

        function expandNotificationList() {
            vm.isNotificationExpanded = !vm.isNotificationExpanded;
        }

        function expandEventList() {
            vm.isEventExpanded = !vm.isEventExpanded;
        }

        function notificationClose() {
            $rootScope.notification.type = "";
            $rootScope.notification.message = "";
        }

        function logout(){
            AuthManager.logout()
            .then(function (data) {
                AuthManager.setFlags();
            })
            .then(function () {
                $state.go("login");
            })
            .catch(function (e) {
                AuthManager.isUserLoggedIn = true;
                console.log("Logout Error: Logout Not Successful");
            });
        }

        function homePage(){
            $state.go("landing-page");
        }
    }

})();