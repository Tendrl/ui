 (function() {
  "use strict";

  var app = angular.module("TendrlModule");

  app.controller("customModalFooterController", customModalFooterController);

  app.component("customModalFooter", {
    bindings: {
      cancelButton: "=",
      cancelButtonCall: "=?",
      nextStepButton: "=",
      nextStepButtonCall: "=?"
    },
    controllerAs: "vm",
    controller: "customModalFooterController",
    templateUrl: "/commons/components/custom-modal/custom-modal-footer.html"
  });

  function customModalFooterController($element, $scope){
    var vm = this;
    vm.cancelButtoncall = vm.cancelButtonCall;
    vm.nextStep = vm.nextStepButtonCall;
  };
}());