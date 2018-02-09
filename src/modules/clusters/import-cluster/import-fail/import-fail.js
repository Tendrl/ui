(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("importFailController", importFailController);

    /*@ngInject*/
    function importFailController($rootScope, $scope, $state, clusterStore, failedJob, Notifications, $uibModal) {

        var vm = this,
            jobId;

        vm.initiateUnmanage = false;
        vm.enableProfiling = true;
        vm.taskInitiated = false;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.jobId = failedJob.jobId;

        vm.modalHeader = {
            "title": "Import Fail",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "type": "button",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Ok",
            "type": "submit",
            "classname": "btn-primary",
            "onCall": vm.confirmModal
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf deleteUserController                

         */

        function cancelModal() {
            $state.go("clusters");
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

        /**
         * @name next
         * @desc takes to next step
         * @memberOf deleteUserController                

         */
        function confirmModal() {
            clusterStore.importCluster($rootScope.clusterTobeImported, vm.enableProfiling)
                .then(function(data) {
                    vm.taskInitiated = true;
                });

            if(vm.taskInitiated){
                Notifications.message("success", "", "Import task has been submitted");
                $state.go('clusters');
            } else {
                Notifications.message("danger", "", "Failed to initiate import");
                $state.go('clusters');
            }

        }

    }

})();