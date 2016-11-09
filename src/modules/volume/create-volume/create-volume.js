(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createVolumeController", createVolumeController);

    /*@ngInject*/
    function createVolumeController($scope, $rootScope, attributeListService) {
        var vm = this;
        vm.formAttributes = {data: {}, isEmpty: true};
        attributeListService.getAttributeList('f82409b8-b5ba-4f91-8486-e0294193268e', 'volume').then(function(attributes) {
              vm.formAttributes.data = attributes;
              vm.formAttributes.isEmpty = false;
        });
    }

})();
