(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("headerController", headerController);

    /*@ngInject*/
    function headerController($rootScope) {

        var vm = this;
        
        vm.notificationClose = notificationClose;

        $rootScope.notification = {
                "type": "",
                "message": ""
        };

        function notificationClose() {
            $rootScope.notification.type = "";
            $rootScope.notification.message = "";
        }
        
    }

})();