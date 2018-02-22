(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("unmanageProgressController", unmanageProgressController);

    /*@ngInject*/
    function unmanageProgressController($rootScope, $scope, $state, clusterStore, progressCluster, Notifications) {

        var vm = this;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.clusterId = progressCluster.clusterId;
        vm.jobId = progressCluster.jobId;

        vm.modalHeader = {
            "title": "Unmanage Cluster",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "View Task Progress",
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
            if (vm.clusterId) {
                vm.closeModal();
                $state.go("global-task-detail", { clusterId: vm.clusterId, taskId: vm.jobId });
            }
        }

    }

})();