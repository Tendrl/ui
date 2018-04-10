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

        vm.taskList = [];
        vm.isDataLoading = true;
        vm.flag = false;
        vm.filteredTaskList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.goToTaskDetail = goToTaskDetail;
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.clearDates = clearDates;
        vm.openFromDate = openFromDate;
        vm.openToDate = openToDate;
        vm.statusIcon = statusIcon;
        vm.showClearDateAction = showClearDateAction;

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
            }, {
                id: "status",
                title: "Status",
                placeholder: "Filter by Status",
                filterType: "select",
                filterValues: ["Processing", "Completed", "Failed"]
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };


        init();

        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;

            taskStore.getJobList(vm.clusterId)
                .then(function(data) {
                    vm.taskList = data;
                    vm.filteredTaskList = vm.taskList;
                    _filterChange(vm.filters);
                    startTimer();
                }).catch(function(e) {
                    vm.taskList = [];
                    vm.filteredTaskList = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });;
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

        function filterByCreatedDate(list) {
            var dateList,
                dateTo,
                dateFrom;

            dateList = new Date(list.createdAt);
            dateFrom = new Date(vm.date.fromDate);
            dateTo = new Date(vm.date.toDate);
            if (vm.date.fromDate && vm.date.toDate) {
                _checkValidDates();
                if (vm.date.fromDate.valueOf() === vm.date.toDate.valueOf()) {
                    return dateList.getDate() === dateTo.getDate();
                } else {
                    dateTo = dateTo.setDate(dateTo.getDate() + 1);
                    return Date.parse(dateList) >= Date.parse(dateFrom) && Date.parse(dateList) <= dateTo;
                }
            } else if (vm.date.fromDate) {
                return Date.parse(dateList) >= Date.parse(dateFrom);
            } else if (vm.date.toDate) {
                dateTo = dateTo.setDate(dateTo.getDate() + 1);
                return Date.parse(dateList) <= dateTo;
            } else {
                return list;
            }
        }

        function clearDates() {
            vm.date.fromDate = null;
            vm.date.toDate = null;
            vm.invalidToDate = false;
        }

        function showClearDateAction() {
            return vm.date.fromDate || vm.date.toDate;
        }

        /*****Private Functions******/

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "jobId") {
                match = item.jobId.match(re) !== null;
            } else if (filter.id === "flow") {
                match = item.flow.match(re) !== null;
            } else if (filter.id === "status") {
                match = item["status"] === filter.value.id || item["status"].toLowerCase() === filter.value.toLowerCase();
            }
            return match;
        }

        function _matchesFilters(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!_matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        }

        function _applyFilters(filters) {
            vm.filteredTaskList = [];
            if (filters && filters.length > 0) {
                vm.taskList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredTaskList.push(item);
                    }
                });
            } else {
                vm.filteredTaskList = vm.taskList;
            }
            vm.filterConfig.resultsCount = vm.filteredTaskList.length;
        }

        function _filterChange(filters) {
            vm.filters = filters;
            vm.filtersText = "";
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });
            _applyFilters(filters);
        }

        function _checkValidDates() {
            if (Date.parse(vm.date.toDate) < Date.parse(vm.date.fromDate)) {
                vm.date.toDate = "";
                vm.invalidToDate = true;
            } else {
                vm.invalidToDate = false;
            }
        }
    }

})();