(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("StopVolumeController", StopVolumeController);

    /*@ngInject*/
    function StopVolumeController($rootScope, $scope, $state, selectedVolume, volumeStore) {

        var vm = this;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.next = next;

        vm.modalHeader = {
            "title": "Stop File Share",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Continue",
            "classname": "btn-primary",
            "onCall": vm.next
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf StopVolumeController
         */

        function cancelModal() {
            $state.go("file-share");
            $rootScope.$emit("modal.done", "cancel");
        }

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf StopVolumeController
         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        /**
         * @name next
         * @desc takes to next step
         * @memberOf StopVolumeController
         */
        function next() {
            volumeStore.doActionOnVolume(selectedVolume, "stop")
                .then(function(data) {
                    vm.jobId = data.job_id;
                    vm.closeModal();
                });

        }

    }

})();
