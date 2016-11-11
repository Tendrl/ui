(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("importClusterController", importClusterController);

    /*@ngInject*/
    function importClusterController(utils, config) {
        var vm = this;

        vm.heading = "Import Cluster";
        vm.isShowImportButton = true;
        vm.notification = "";
        vm.importFlows = [];
        vm.setImportClusterInfo = setImportClusterInfo;
        vm.formAttributes = {data: {}, isEmpty: true};
        vm.callBack = callBack;
        vm.closeNotification = closeNotification;

        utils.getClusterImportFlow().then(function(importFlows) {
              vm.importFlows = importFlows;
        });

        function setImportClusterInfo(flow) {
            vm.heading = flow.name;
            vm.isShowImportButton = false;
            vm.postUrl = config.baseUrl + flow.name;
            vm.formAttributes.data = flow.attributes;
            vm.formAttributes.isEmpty = false;
        }

        function callBack(response) {
            vm.notification = "Cluster is imported successfully. and JOB-ID is - " + response.job_id + " And Cluster import is " + response.status;
        }

        function closeNotification() {
            vm.notification = "";
        }

    }

})();
