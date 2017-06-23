(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("RebalanceVolumeController", RebalanceVolumeController);

    /*@ngInject*/
    function RebalanceVolumeController($rootScope, $scope, $state, selectedVolume, volumeStore) {

        var vm = this;

        vm.fixLayout = "true";
        vm.taskSubmitted = false;
        vm.volume = selectedVolume;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.rebalance = rebalance;
        vm.viewTaskProgress = viewTaskProgress;

        vm.modalHeader = {
            "title": "Rebalance File Share",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Start Rebalance",
            "classname": "btn-primary",
            "onCall": vm.rebalance
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf RebalanceVolumeController
         */

        function cancelModal() {
            $state.go("file-share");
            $rootScope.$emit("modal.done", "cancel");
        }

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf RebalanceVolumeController
         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        /**
         * @name rebalance
         * @desc rebalance the volume
         * @memberOf RebalanceVolumeController
         */
        function rebalance() {
            volumeStore.rebalanceVolume(selectedVolume, vm.fixLayout)
                .then(function(data) {
                    vm.jobId = data.job_id;
                    vm.taskSubmitted = true;
                });
        }

        /**
         * @name viewTaskProgress
         * @desc takes to task progress page
         * @memberOf RebalanceVolumeController
         */
        function viewTaskProgress() {
            vm.closeModal();
            $state.go("task-detail", { taskId: vm.jobId });
        }

    }

})();
