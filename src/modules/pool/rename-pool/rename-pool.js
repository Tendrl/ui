(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("renamePoolController", renamePoolController);

    /*@ngInject*/
    function renamePoolController($rootScope, $scope, $state, poolData, utils) {

        var vm = this;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.renamePool = renamePool;
        vm.viewTaskProgress = viewTaskProgress;

        vm.taskSubmitted = false;
        vm.errorInProcess = false;
        vm.modalHeader = {
            "title": "Rename Pool",
            "close": vm.closeModal
        };
        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Rename",
            "classname": "btn-primary",
            "onCall": vm.renamePool
        }];

        init();

        function init() {
            vm.renamePoolCopy = angular.copy(poolData);
            vm.renamePoolData = poolData;
        }

        function cancelModal() {
            $rootScope.$emit("modal.done", "cancel");
        };

        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        };

        function renamePool() {
            _renamePoolPost();
        };

        function _renamePoolPost() {
            var postData;

            postData = { "Pool.pool_id": parseInt(vm.renamePoolCopy.id), "Pool.poolname": vm.renamePoolCopy.name };

            utils.takeAction(postData, "CephRenamePool", "PUT", vm.renamePoolCopy.clusterId)
                .then(function(response) {
                    vm.jobId = response.job_id;
                    vm.taskSubmitted = true;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                });
        }

        function viewTaskProgress() {
            vm.closeModal();
            setTimeout(function() {
                $state.go("task-detail", { taskId: vm.jobId });
            }, 1000);
        }
    }

})();
