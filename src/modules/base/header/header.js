(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("headerController", headerController);

    /*@ngInject*/
    function headerController($rootScope, $state, AuthManager) {

        var vm = this;
        
        vm.notificationClose = notificationClose;
        vm.logout = logout;
        vm.homePage = homePage;

        $rootScope.notification = {
            "type": "",
            "message": ""
        };

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