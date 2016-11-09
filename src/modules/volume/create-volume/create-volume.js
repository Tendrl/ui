(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createVolumeController", createVolumeController);

    /*@ngInject*/
    function createVolumeController(utils, config) {
        var vm = this;

        vm.formAttributes = {data: {}, isEmpty: true};

        utils.getAttributeList(config.clusterId, "volume").then(function(attributes) {
              vm.formAttributes.data = attributes;
              vm.formAttributes.isEmpty = false;
        });
    }

})();
