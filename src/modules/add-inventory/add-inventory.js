(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("addInventoryController", addInventoryController);

    /*@ngInject*/
    function addInventoryController($state, $stateParams, utils, $rootScope) {

        var vm = this;
        vm.createFlows = {};
        vm.callBack = callBack;
        vm.clusterId = $stateParams.clusterId;

        utils.getObjectWorkflows(vm.clusterId).then(function(flows) {
            vm.createFlows = flows[0];
        });

        function callBack(response) {
            $rootScope.notification.type = "success";
            $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
        }

    }

})();