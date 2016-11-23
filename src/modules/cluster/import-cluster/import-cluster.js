(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("importClusterController", importClusterController);

    /*@ngInject*/
    function importClusterController($rootScope, $state, utils, config) {
        var vm = this;

        vm.heading = "Import Cluster";
        vm.isShowImportButton = true;
        vm.importFlows = [];
        vm.selectedFlow = {};
        vm.setImportClusterInfo = setImportClusterInfo;
        vm.callBack = callBack;

        utils.getObjectWorkflows().then(function(importFlows) {
              vm.importFlows = importFlows;
        });

        function setImportClusterInfo(flow) {
            vm.heading = flow.name;
            vm.isShowImportButton = false;
            vm.selectedFlow = flow;
        }

        function callBack(response) {
            $rootScope.notification.type = "success";
            $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
            $state.go("cluster");
        }

    }

})();