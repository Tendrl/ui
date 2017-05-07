(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("renamePoolController", renamePoolController);

    /*@ngInject*/
    function renamePoolController($rootScope, $scope, $state, poolData, utils) {

        var vm = this;

        init();

        function init() {
            vm.renamePoolCopy = angular.copy(poolData);
            vm.renamePoolData = poolData;
        }

        vm.cancelModal = function() {
            $rootScope.$emit('modal.done', 'cancel');
        };

        vm.closeModal = function() {
            $rootScope.$emit('modal.done', 'close');
        };

        vm.renamePool = function() {
            vm.closeModal();
            _renamePoolPost();
            $state.go("pool");
        };

        vm.modalHeader = {
            "title": "Rename Pool",
            "close": vm.closeModal
        };

        vm.modalFooter = {
            "cancelButton": {
                "name": "Cancel",
                "classname": "btn-default",
            },
            "nextStepButton": {
                "name": "Rename",
                "classname": "btn-primary",
            },
            "cancelButtonCall": vm.cancelModal,
            "nextStepButtonCall": vm.renamePool
        };

        function _renamePoolPost() {
            var postData;

            postData = { "Pool.pool_id": parseInt(vm.renamePoolCopy.id), "Pool.poolname": vm.renamePoolCopy.name };

            utils.takeAction(postData, "CephUpdatePool", "PUT", vm.renamePoolCopy.clusterId)
                .then(function(response) {
                    vm.jobId = response.job_id;
                })
        }
    }

})();
