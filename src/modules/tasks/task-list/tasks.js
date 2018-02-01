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

    function taskController($rootScope, $scope, $interval, $state, $timeout, $filter, $stateParams, orderByFilter, config, taskStore, utils) {


        var vm = this,
            jobTimer,
            toDate,
            count;

        vm.tasksStatus = ["processing", "finished", "failed"];
        vm.taskList = [];
        vm.isDataLoading = true;
        vm.flag = false;
        vm.filterBy = "job_id";
        vm.filterByValue = "Task ID";
        vm.filterPlaceholder = "Task ID";
        vm.count = 1;

        vm.goToTaskDetail = goToTaskDetail;
        vm.getStatusText = getStatusText;
        vm.updateStatus = updateStatus;
        vm.isSelectedStatus = isSelectedStatus;
        vm.filterByStatus = filterByStatus;
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.clearAllFilters = clearAllFilters;
        vm.addTooltip = addTooltip;
        vm.changingFilterBy = changingFilterBy;
        vm.openFromDate = openFromDate;
        vm.openToDate = openToDate;
        vm.checkValidDates = checkValidDates;

        vm.date = {
            fromDate: "",
            toDate: "",
        };

        vm.toDateOptions = {
            format: "dd M yyyy",
            startDate: $filter("date")(vm.date.fromDate, "dd MMM yyyy")
        };

        vm.fromDateOptions = {
            format: "dd M yyyy"
        };

        vm.popupFrom = {
            opened: false
        };

        vm.popupTo = {
            opened: false
        };

        init();

        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;
            taskStore.getJobList()
                .then(function(data) {
                    //data = orderByFilter(data, "created_at", "job_id");
                    //data = orderByFilter(data, "job_id");
                    vm.taskList = data;
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function startTimer() {

            jobTimer = $interval(function() {

                taskStore.getJobList()
                    .then(function(data) {
                        $interval.cancel(jobTimer);
                        vm.taskList = data;
                        vm.isDataLoading = false;
                        startTimer();
                    });

            }, 1000 * config.statusRefreshIntervalTime, 1);
        }

        function openFromDate() {
            vm.popupFrom.opened = true;
        };

        function openToDate() {
            vm.popupTo.opened = true;
        };

        function goToTaskDetail(id) {
            if (vm.clusterId) {
                $state.go("task-detail", { clusterId: vm.clusterId, taskId: id });
            }

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
            if (vm.count === 1 && vm.date.fromDate && vm.date.toDate) {
                checkValidDates();
            }

            if (vm.date.fromDate && vm.date.toDate) {
                console.log(Date.parse(list.created_at) >= Date.parse(vm.date.fromDate) && Date.parse(list.created_at) <= Date.parse(vm.date.toDate));
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
                vm.count++;
            } else {
                vm.invalidToDate = false;
            }
        }

        vm.resetCount = function() {
            vm.count = 1;
        };

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function clearAllFilters() {
            vm.date.fromDate = null;
            vm.date.toDate = null;
            vm.invalidToDate = false;
            vm.filterBy = "job_id";
            vm.filterByValue = "Task ID";
            vm.filterPlaceholder = "Task ID";
            vm.searchBy = {};
            vm.tasksStatus = ["processing", "finished", "failed"];
        }

        function changingFilterBy(filterValue) {
            vm.filterBy = filterValue;
            switch (filterValue) {
                case "job_id":
                    vm.filterByValue = "Task ID";
                    vm.filterPlaceholder = "Task ID";
                    break;

                case "flow":
                    vm.filterByValue = "Task";
                    vm.filterPlaceholder = "Task";
                    break;
            };
        }
    }

})();