(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("workflowController", workflowController);

    /*@ngInject*/
    function workflowController($rootScope, $state, $stateParams) {
        var vm = this;

        vm.callBack = callBack;
        vm.objectName = $stateParams.objectName;
        vm.objectId = $stateParams.objectId;
       
        function callBack(response) {
            $rootScope.notification.type = "success";
            $rootScope.notification.message = vm.objectName + " action is done successfully. and JOB-ID is - " + response.job_id;
            $state.go($rootScope.previousState);
        }

    }

})();
