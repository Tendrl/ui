 (function() {
  "use strict";

  var app = angular.module("TendrlModule");

  app.controller("customModalHeaderController", customModalHeaderController);

  app.component("customModalHeader", {
    bindings: {
      title: '=',
      close: "=?"
    },
    controllerAs: "vm",
    controller: "customModalHeaderController",
    templateUrl: "/commons/components/custom-modal/custom-modal-header.html"
  });

  function customModalHeaderController($element, $scope){
    var vm = this;
    vm.closeModal = vm.close;
  };
}());