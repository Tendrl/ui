(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("errorListController", errorListController);

    /*@ngInject*/
    function errorListController($rootScope, cluster) {

        var vm = this;

        vm.messages = cluster.errors;
        vm.closeModal = closeModal;

        vm.modalHeader = {
            "title": "Import Failed",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Close",
            "type": "button",
            "classname": "btn-primary",
            "onCall": vm.closeModal
        }];

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf deleteUserController                

         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

    }

})();
