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
        function taskDetailController($rootScope, $scope, $interval, $state, $stateParams, taskStore, config, utils, clusterStore) {

        var vm = this,
            statusTimer,
            msgTimer,
            isMessagesLoading;

        vm.isDataLoading = true;
        vm.isMessagesLoading = true;
        vm.goToClusterTask = goToClusterTask;
        vm.goToClusterDetail = goToClusterDetail;

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
            if ($rootScope.clusterData) {
                vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
                vm.clusterName = vm.clusterObj.cluster_id || "NA";
                vm.clusterStatus = clusterStore.checkStatus(vm.clusterObj);

                taskStore.getJobDetail($stateParams.taskId)
                    .then(function(data) {
                        vm.taskDetail = data;
                        vm.isDataLoading = false;

                        _getTaskLogs();
                        startStatusTimer();
                        startMessageTimer();
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = data;

                        vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
                        vm.clusterName = vm.clusterObj.cluster_id || "NA";
                        vm.clusterStatus = clusterStore.checkStatus(vm.clusterObj);

                        taskStore.getJobDetail($stateParams.taskId)
                            .then(function(data) {
                                vm.taskDetail = data;
                                vm.isDataLoading = false;

                                _getTaskLogs();
                                startStatusTimer();
                                startMessageTimer();
                            });
                    });
            }

        }

        function startStatusTimer() {

            statusTimer = $interval(function() {

                if (vm.taskDetail && (vm.taskDetail.status === "processing" || vm.taskDetail.status === "new")) {
                    taskStore.getTaskStatus($stateParams.taskId)
                        .then(function(data) {
                            $interval.cancel(statusTimer);
                            vm.taskDetail.status = data.status;
                            startStatusTimer();
                        });
                }

            }, 1000 * config.statusRefreshIntervalTime, 1);
        }


        function goToClusterTask() {
            $state.go("cluster-tasks", { clusterId: vm.clusterId });
        }

        function startMessageTimer() {
            msgTimer = $interval(function() {

                if (vm.taskDetail && (vm.taskDetail.status === "processing" || vm.taskDetail.status === "new")) {
                    _getTaskLogs();
                }

            }, 1000 * config.msgRefreshIntervalTime, 1);
        }

        function goToClusterDetail() {
            $state.go("cluster-hosts", {clusterId: vm.taskDetail.parameters["TendrlContext.integration_id"]});
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(statusTimer);
            $interval.cancel(msgTimer);
        });

    }

})();