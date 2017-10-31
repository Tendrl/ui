(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("tasks", {

            restrict: "E",
            templateUrl: "/modules/tasks/task-list/tasks.html",
            bindings: {},
            controller: taskController,
            controllerAs: "taskCntrl"
        });

    /*@ngInject*/
    function taskController($rootScope, $scope, $interval, $state, $timeout, $filter, orderByFilter, config, taskStore, utils) {

        var vm = this,
            jobTimer,
            toDate,
            count;

        vm.tasksStatus = ["processing", "finished", "failed"];

        vm.goToTaskDetail = goToTaskDetail;
        vm.getStatusText = getStatusText;
        vm.updateStatus = updateStatus;
        vm.isSelectedStatus = isSelectedStatus;
        vm.filterByStatus = filterByStatus;
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.clearDate = clearDate;
        vm.taskList = [];
        vm.isDataLoading = true;
        count = 1;
        vm.addTooltip = addTooltip;
        vm.flag = false;

        vm.date = {
            fromDate: "",
            toDate: "",
        };

        vm.toDateOptions = {
            autoclose: true,
            todayBtn: "linked",
            todayHighlight: true,
            format: "dd M yyyy",
            startDate: $filter("date")(vm.date.fromDate, "dd MMM yyyy")
        };

        vm.fromDateOptions = {
            autoclose: true,
            todayBtn: "linked",
            todayHighlight: true,
            format: "dd M yyyy"
        };

        init();

        function init() {
            taskStore.getJobList()
                .then(function(data) {
                    //data = orderByFilter(data, "created_at", "job_id");
                    //data = orderByFilter(data, "job_id");
                    vm.taskList = data;
                    _setUpdatedDate();
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function _setUpdatedDate() {
            var len,
                temp,
                i;

            len = vm.taskList.length;

            for (i = 0; i < len; i++) {
                temp = new Date(vm.taskList[i].updated_at);
                vm.taskList[i].updatedAt = temp;
            }

        }

        function startTimer() {

            jobTimer = $interval(function() {

                taskStore.getJobList()
                    .then(function(data) {
                        $interval.cancel(jobTimer);
                        vm.taskList = data;
                        _setUpdatedDate();
                        vm.isDataLoading = false;
                        startTimer();
                    });

            }, 1000 * config.statusRefreshIntervalTime, 1);
        }

        function goToTaskDetail(id) {
            $state.go("task-detail", { taskId: id });
        }

        function getStatusText(status) {

            if (status === "finished") {
                return "Completed";
            } else if (status === "failed") {
                return "Failed";
            } else if (status === "warning") {
                return "Completed with Errors";
            } else if (status === "processing") {
                return "Processing";
            } else if (status === "new") {
                return "New";
            }
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(jobTimer);
        });

        function updateStatus(status) {
            var index;

            index = vm.tasksStatus.indexOf(status);

            if (index === -1) {
                vm.tasksStatus.push(status);
            } else {
                vm.tasksStatus.splice(index, 1)
            }
        }

        function isSelectedStatus(status) {
            return vm.tasksStatus.indexOf(status) > -1;
        }

        //custom filter
        function filterByStatus(list) {

            if (vm.tasksStatus.length) {
                return vm.tasksStatus.indexOf(list.status) > -1;
            }
        }

        function filterByCreatedDate(list) {
            if (count === 1 && vm.date.fromDate && vm.date.toDate) {
                checkValidDates();
            }

            if (vm.date.fromDate && vm.date.toDate) {
                return Date.parse(list.created_at) >= Date.parse(vm.date.fromDate) && Date.parse(list.created_at) <= Date.parse(vm.date.toDate);
            } else if (vm.date.fromDate) {
                return Date.parse(list.created_at) >= Date.parse(vm.date.fromDate);
            } else if (vm.date.toDate) {
                return Date.parse(list.created_at) <= Date.parse(vm.date.toDate);
            } else {
                return list;
            }
        }

        function checkValidDates() {
            if (Date.parse(vm.date.toDate) < Date.parse(vm.date.fromDate)) {
                vm.date.toDate = "";
                vm.invalidToDate = true;
                count++;
            } else {
                vm.invalidToDate = false;
            }
        }

        vm.resetCount = function() {
            count = 1;
        };

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function clearDate(type) {
            if (type === "from") {
                vm.date.fromDate = "";
            } else if (type === "to") {
                vm.date.toDate = "";
            }
        }
    }

})();
