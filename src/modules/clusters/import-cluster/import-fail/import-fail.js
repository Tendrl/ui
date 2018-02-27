(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("importFailController", importFailController);

    /*@ngInject*/
    function importFailController($rootScope, $scope, $state, taskStore, failedJob) {

        var vm = this,
            jobId;

        vm.initiateUnmanage = false;
        vm.enableProfiling = true;
        vm.taskInitiated = false;
        vm.isMessagesLoading = true;
        vm.logs = [];

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.jobId = failedJob;

        vm.modalHeader = {
            "title": "Details:" + vm.jobId,
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Close",
            "type": "button",
            "classname": "btn-primary",
            "onCall": vm.cancelModal
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf deleteUserController                

         */

        init();

        function init() {
            taskStore.getTaskLogs(vm.jobId)
                .then(function(response) {
                    vm.logs = response;
                    vm.isMessagesLoading = false;
                }).catch(function(e) {
                    vm.isMessagesLoading = false;
                });
        }

        function cancelModal() {
            $state.go("import-cluster");
            $rootScope.$emit("modal.done", "cancel");
        }

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