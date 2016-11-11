(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createVolumeController", createVolumeController);

    /*@ngInject*/
    function createVolumeController(utils, config) {
        var vm = this;

        vm.notification = "";
        vm.formAttributes = {data: {}, isEmpty: true};
        vm.postUrl = utils.getActionDetails();
        vm.callBack = callBack;
        vm.closeNotification = closeNotification;

        utils.getAttributeList(config.clusterId, "volume").then(function(attributes) {
              vm.formAttributes.data = attributes;
              vm.formAttributes.isEmpty = false;
        });

        function callBack(response) {
            vm.notification = "Volume is created successfully. and JOB-ID is - " + response.job_id + " And Volume creation is " + response.status;
        }

        function closeNotification() {
            vm.notification = "";
        }
    }

})();


