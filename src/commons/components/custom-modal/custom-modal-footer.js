(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("customModalFooter", {
        bindings: {
            modalFooter: "="
        },
        controllerAs: "vm",
        controller: customModalFooterController,
        templateUrl: "/commons/components/custom-modal/custom-modal-footer.html"
    });

    function customModalFooterController($element, $scope) {
        var vm = this;       
    };
}());
