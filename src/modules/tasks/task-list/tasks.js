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

        vm.tasksStatus = ["Processing", "Completed", "Failed"];
        vm.taskList = [];
        vm.isDataLoading = true;
        vm.flag = false;
        vm.filteredTaskList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.goToTaskDetail = goToTaskDetail;
        vm.updateStatus = updateStatus;
        vm.isSelectedStatus = isSelectedStatus;
        vm.filterByStatus = filterByStatus;
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.clearAllFilters = clearAllFilters;
        vm.openFromDate = openFromDate;
        vm.openToDate = openToDate;
        vm.statusIcon = statusIcon;

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

        var matchesFilter = function(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, 'i');

            if (filter.id === 'jobId') {
                match = item.jobId.match(re) !== null;
            } else if (filter.id === 'flow') {
                match = item.flow.match(re) !== null;
            }
            return match;
        };

        var matchesFilters = function(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        };

        var applyFilters = function(filters) {
            vm.filteredTaskList = [];
            if (filters && filters.length > 0) {
                vm.taskList.forEach(function(item) {
                    if (matchesFilters(item, filters)) {
                        vm.filteredTaskList.push(item);
                    }
                });
            } else {
                vm.filteredTaskList = vm.taskList;
            }
            vm.filterConfig.resultsCount = vm.filteredTaskList.length;
        };

        var filterChange = function(filters) {
            vm.filters = filters;
            vm.filtersText = "";
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.filterCategory) {
                    vm.filtersText += ((filter.value.filterCategory.title || filter.value.filterCategory) +
                        filter.value.filterDelimiter + (filter.value.filterValue.title || filter.value.filterValue));
                } else if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });
            applyFilters(filters);
        };

        vm.filterConfig = {
            fields: [{
                id: "jobId",
                title: "Task ID",
                placeholder: "Filter by Task ID",
                filterType: "text"
            }, {
                id: "flow",
                title: "Task",
                placeholder: "Filter by Task ID",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: filterChange
        };

        init();

        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;

            taskStore.getJobList(vm.clusterId)
                .then(function(data) {
                    vm.taskList = data;
                    vm.filteredTaskList = vm.taskList;
                    vm.isDataLoading = false;
                    filterChange(vm.filters);
                    startTimer();
                });
        }

        function startTimer() {

            jobTimer = $interval(function() {
                init();
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

        function statusIcon(status) {
            if (status === "Completed") {
                return "pficon pficon-ok";
            } else if (status === "Failed") {
                return "pficon pficon-error-circle-o";
            } else if (status === "Completed with Errors") {
                return "pficon pficon-warning-triangle-o";
            } else if (status === "Processing" || status === "New") {
                return "fa fa-spinner";
            } else {
                return "fa fa-question";
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

            if (vm.date.fromDate && vm.date.toDate) {
                _checkValidDates();
                if (vm.date.fromDate.valueOf() === vm.date.toDate.valueOf()) {
                    return Date.parse(list.createdAt.getDate()) === Date.parse(vm.date.fromDate.getDate());
                } else {
                    return Date.parse(list.createdAt) >= Date.parse(vm.date.fromDate) && Date.parse(list.createdAt) <= Date.parse(vm.date.toDate);
                }
            } else if (vm.date.fromDate) {
                return Date.parse(list.createdAt) >= Date.parse(vm.date.fromDate);
            } else if (vm.date.toDate) {
                return Date.parse(list.createdAt) <= Date.parse(vm.date.toDate);
            } else {
                return list;
            }
        }

        function _checkValidDates() {
            if (Date.parse(vm.date.toDate) < Date.parse(vm.date.fromDate)) {
                vm.date.toDate = "";
                vm.invalidToDate = true;
            } else {
                vm.invalidToDate = false;
            }
        }

        function clearAllFilters() {
            vm.date.fromDate = null;
            vm.date.toDate = null;
            vm.invalidToDate = false;
            vm.tasksStatus = ["Processing", "Completed", "Failed"];
        }
    }

})();
