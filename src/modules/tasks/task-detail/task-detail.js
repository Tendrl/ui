(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("taskDetailController", taskDetailController);

    /*@ngInject*/
    function taskDetailController($rootScope, $scope, $interval, $state, $stateParams, taskStore, config, utils) {

        var vm = this,
            statusTimer,
            msgTimer;

        vm.isDataLoading = true;

        init();

        function _getTaskLogs() {
            taskStore.getTaskLogs($stateParams.taskId)
                .then(function(response) {
                    $interval.cancel(msgTimer);
                    if(typeof vm.taskDetail !== "undefined") {
                        vm.taskDetail.logs = response;
                    }
                    startMessageTimer();
                });
        }

        function init() {
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