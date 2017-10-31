(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("taskDetail", {

            restrict: "E",
            templateUrl: "/modules/tasks/task-detail/task-detail.html",
            bindings: {},
            controller: taskDetailController,
            controllerAs: "taskDetailCntrl"
        });

    /*@ngInject*/
    function taskDetailController($rootScope, $scope, $interval, $state, $stateParams, taskStore, config, utils) {

        var vm = this,
            statusTimer,
            msgTimer,
            isMessagesLoading;

        vm.isDataLoading = true;
        vm.isMessagesLoading = true;

        init();

        function _getTaskLogs() {
            taskStore.getTaskLogs($stateParams.taskId)
                .then(function(response) {
                    $interval.cancel(msgTimer);
                    if(typeof vm.taskDetail !== "undefined") {
                        vm.taskDetail.logs = response;
                        vm.isMessagesLoading = false;
                    }
                    startMessageTimer();
                });
        }

        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;

            taskStore.getJobDetail($stateParams.taskId)
                .then(function(data) {
                    vm.taskDetail = data;
                    vm.isDataLoading = false;

                    _getTaskLogs();
                    startStatusTimer();
                    startMessageTimer();
                });
        }

        function startStatusTimer() {

            statusTimer = $interval(function() {

                if(vm.taskDetail && (vm.taskDetail.status === "processing" || vm.taskDetail.status === "new")){
                    taskStore.getTaskStatus($stateParams.taskId)
                        .then(function(data) {
                            $interval.cancel(statusTimer);
                            vm.taskDetail.status = data.status;
                            startStatusTimer();
                        });
                }

            }, 1000 * config.statusRefreshIntervalTime, 1);
        }

        function startMessageTimer() {
            msgTimer = $interval(function() {

                if(vm.taskDetail && (vm.taskDetail.status === "processing" || vm.taskDetail.status === "new")){
                    _getTaskLogs();
                }

            }, 1000 * config.msgRefreshIntervalTime, 1);
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(statusTimer);
            $interval.cancel(msgTimer);
        });

    }

})();