(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("alerts", {

            restrict: "E",
            templateUrl: "/modules/alerts/alerts.html",
            bindings: {},
            controller: alertController,
            controllerAs: "alertCntrl"
        });

    /*@ngInject*/
    function alertController($rootScope, $scope, $interval, $state, $timeout, $filter, config, eventStore, utils) {

        var vm = this,
            alertTimer,
            toDate,
            count;

        vm.alertStatus = [];
        vm.isDataLoading = true;
        count = 1;
        vm.severity = "";
        vm.searchDescText = "";
        vm.filterBy = "clusterName";
        vm.filterByText = "Filter by Cluster Name";
        vm.searchBy = {};
        vm.alertList = [];
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.resetCount = resetCount;
        vm.setSeverity = setSeverity;
        vm.filterBySeverity = filterBySeverity;
        vm.searchByDesc = searchByDesc;
        vm.clearAllFilters = clearAllFilters;
        vm.clearDate = clearDate;
        vm.changeOption = changeOption;

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
            eventStore.getAlertList()
                .then(function(list) {
                    $interval.cancel(alertTimer);
                    vm.alertList = list;
                    vm.isDataLoading = false;
                    startAlertTimer();
                    vm.severityList = utils.getAlertSeverityList(vm.filteredAlertList);
                });
        }

        function startAlertTimer() {
            alertTimer = $interval(function() {
                init();
            }, 1000 * config.eventsRefreshIntervalTime, 1);
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(alertTimer);
        });

        $scope.$watch(angular.bind(this, function(filteredAlertList) {
            return vm.filteredAlertList;
        }), function(newVal, oldVal) {
            if (newVal !== oldVal) {
                vm.severityList = utils.getAlertSeverityList(vm.filteredAlertList);
            }
        }, true);

        $scope.$watch(angular.bind(this, function() {
            return vm.searchBy.severity;
        }), function(newVal, oldVal) {
            vm.severity = vm.searchBy.severity;
        });

        function filterByCreatedDate(list) {
            if (count === 1 && vm.date.fromDate && vm.date.toDate) {
                checkValidDates();
            }

            if (vm.date.fromDate && vm.date.toDate) {
                return Date.parse(list.timeStamp) >= Date.parse(vm.date.fromDate) && Date.parse(list.timeStamp) <= Date.parse(vm.date.toDate);
            } else if (vm.date.fromDate) {
                return Date.parse(list.timeStamp) >= Date.parse(vm.date.fromDate);
            } else if (vm.date.toDate) {
                return Date.parse(list.timeStamp) <= Date.parse(vm.date.toDate);
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

        function resetCount() {
            count = 1;
        }

        function filterBySeverity(list) {
            if (!vm.severity) {
                return list;
            } else if (list.severity.charAt(0) === vm.severity.charAt(0)) {
                return list;
            }
        }

        function setSeverity(value) {
            vm.changeOption();
            vm.severity = value;
            vm.filterBy = "severity";
            vm.searchBy[vm.filterBy] = value;
        }

        function changeOption() {
            vm.searchBy = {};

            switch (vm.filterBy) {
                case "clusterName":
                    vm.filterByText = "Filter by Cluster name";
                    break;

                case "fqdn":
                    vm.filterByText = "Filter by Host name";
                    break;

                case "severity":
                    vm.filterByText = "Filter by Severity";
                    break;
            }
        }

        function searchByDesc(list) {
            if (!vm.searchDescText) {
                return list;
            } else if (vm.searchDescText && (list.desc.toLowerCase()).indexOf(vm.searchDescText.toLowerCase()) !== -1) {
                return list;
            }
        }

        function clearAllFilters() {
            vm.searchBy[vm.filterBy] = "";
            vm.date.toDate = "";
            vm.date.fromDate = "";
            vm.searchDescText = "";
            vm.filterBy = "clusterName";
            vm.severity = "";
            vm.filterByText = "Filter by Cluster name";
            vm.invalidToDate = false;
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
