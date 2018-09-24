(function() {

    "use strict";

    angular
        .module("TendrlModule")
        .component("globalTaskDetail", {

            restrict: "E",
            templateUrl: "/modules/tasks/global-task-detail/global-task-detail.html",
            bindings: {},
            controller: globalTaskDetailController,
            controllerAs: "glbTaskDetailCntrl"
        });

    /*@ngInject*/
    function globalTaskDetailController($rootScope, $scope, $interval, $state, $stateParams, taskStore, config, clusterStore, utils) {

        var vm = this,
            statusTimer,
            msgTimer,
            isMessagesLoading,
            count = 1;

        vm.isDataLoading = true;
        vm.showLoadingIcon = false;
        vm.isMessagesLoading = true;
        vm.taskDetail = [];
        vm.goToClusterDetail = goToClusterDetail;

        //To refresh the selector selected option
        utils.refershSelector();
        init();

        function init() {

            $rootScope.selectedClusterOption = "";
            vm.clusterId = $stateParams.clusterId;
            if ($rootScope.clusterData) {
                _getTaskList();
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        _getTaskList();
                    });
            }
        }

        function goToClusterDetail() {
            vm.showLoadingIcon = true;
            clusterStore.getClusterList()
                .then(function(data) {
                    $state.go("cluster-hosts", { clusterId: vm.taskDetail.parameters["TendrlContext.integration_id"] });
                    vm.showLoadingIcon = false;
                });
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

            }, 1000 * config.msgRefreshIntervalTime, 1);
        }

        function startMessageTimer() {
            msgTimer = $interval(function() {

                if (count < 5) {
                    _getTaskLogs();
                }

                if (vm.taskDetail && (vm.taskDetail.status === "finished" || vm.taskDetail.status === "failed")) {
                    count++;
                }

            }, 1000 * config.msgRefreshIntervalTime, 1);
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(statusTimer);
            $interval.cancel(msgTimer);
        });

        function _getTaskList() {

            taskStore.getJobDetail($stateParams.taskId)
                .then(function(data) {
                    vm.taskDetail = data;
                    _getTaskLogs();
                    startStatusTimer();
                    startMessageTimer();
                }).catch(function() {
                    vm.taskDetail = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        function _getTaskLogs() {
            taskStore.getTaskLogs($stateParams.taskId)
                .then(function(response) {
                    $interval.cancel(msgTimer);

                    if (typeof vm.taskDetail !== "undefined") {

                        vm.taskDetail.logs = response;
                        vm.isMessagesLoading = false;
                    }
                    startMessageTimer();
                });
        }
    }

})();