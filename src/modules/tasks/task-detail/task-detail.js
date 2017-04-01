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
                    if(typeof vm.taskDetail !== "undefined") {
                        vm.taskDetail.logs = response;
                    }
                });
        }

        function init() {
            taskStore.getJobDetail($stateParams.taskId)
                .then(function(data) {
                    vm.taskDetail = data;
                    vm.isDataLoading = false;

                    _getTaskLogs();
                });
        }

       function _updateStatus() {
            taskStore.getTaskStatus($stateParams.taskId)
                .then(function(data) {
                    vm.taskDetail.status = data.status;
                });
       } 

        /*Refreshing list after each 2 mins interval*/
        statusTimer = $interval(function () {
            _updateStatus();
        }, 1000 * config.statusRefreshIntervalTime );

        msgTimer = $interval(function () {
            _getTaskLogs();
        }, 1000 * config.msgRefreshIntervalTime );

        $scope.$on("$destroy", function() {
            $interval.cancel(statusTimer);
            $interval.cancel(msgTimer);
        });
            

    }

})();
