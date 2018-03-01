(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("unmanageConfirmController", unmanageConfirmController);

    /*@ngInject*/
    function unmanageConfirmController($rootScope, $scope, $state, clusterStore, selectedCluster, Notifications, $uibModal) {

        var vm = this,
            jobId;

        vm.initiateUnmanage = false;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.clusterId = selectedCluster.clusterId;

        vm.modalHeader = {
            "title": "Unmanage Cluster",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "type": "button",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Unmanage",
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

        function openProgressModal(clusterId, jobId) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/unmanage-cluster/unmanage-progress/unmanage-progress.html",
                controller: "unmanageProgressController",
                controllerAs: "vm",
                size: "md",
                resolve: {
                    progressCluster: function() {
                        return {
                            clusterId: clusterId,
                            jobId: jobId
                        };
                    }
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }

        /**
         * @name next
         * @desc takes to next step
         * @memberOf deleteUserController                

         */
        function confirmModal() {

            vm.closeModal();
            vm.initiateUnmanage = true;

            clusterStore.doClusterUnmanage(vm.clusterId)
                .then(function(data) {
                    vm.initiateUnmanage = false;
                    jobId = data.job_id;
                    openProgressModal(vm.clusterId, jobId);
                    selectedCluster.disableUnmanage = true;
                }).catch(function(error) {
                    Notifications.message("danger", "", "Failed to initiate unmanage");
                });
        }
    }

})();