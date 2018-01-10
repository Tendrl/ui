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
            toDate,
            count;

        vm.alertStatus = [];
        vm.isDataLoading = true;
        count = 1;
        vm.severity = "";
        vm.searchDescText = "";
        vm.filterBy = "clusterName";
        vm.filterPlaceholder = "Cluster Name";
        vm.searchBy = {};
        vm.alertList = [];
        vm.filterBy = "clusterName";
        vm.filterByValue = "Cluster";

        vm.filterByCreatedDate = filterByCreatedDate;
        vm.resetCount = resetCount;
        vm.setSeverity = setSeverity;
        vm.filterBySeverity = filterBySeverity;
        vm.searchByDesc = searchByDesc;
        vm.clearAllFilters = clearAllFilters;
        vm.clearDate = clearDate;
        vm.changingFilterBy = changingFilterBy;

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
                    vm.alertList = list;
                    vm.isDataLoading = false;
                    vm.severityList = utils.getAlertSeverityList(vm.filteredAlertList);
                });
        }

        $scope.$on("GotAlertData", function(event, data) {
            if ($rootScope.alertList !== null) {
                vm.alertList = $rootScope.alertList;
                vm.isDataLoading = false;
                vm.severityList = utils.getAlertSeverityList(vm.filteredAlertList);

            }
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
            vm.severity = value;
            vm.filterBy = "severity";
            vm.filterByValue = "Severity";
            vm.searchBy[vm.filterBy] = value;
        }

        function changingFilterBy(filterValue) {
            vm.filterBy = filterValue;
            switch (filterValue) {
                case "clusterName":
                    vm.filterByValue = "Cluster";
                    vm.filterPlaceholder = "Cluster name";
                    break;

                case "fqdn":
                    vm.filterByValue = "Host";
                    vm.filterPlaceholder = "Host name";
                    break;

                case "severity":
                    vm.filterByValue = "Severity";
                    vm.filterPlaceholder = "Severity";
                    break;
            };
        }

        function searchByDesc(list) {
            if (!vm.searchDescText) {
                return list;
            } else if (vm.searchDescText && (list.desc.toLowerCase()).indexOf(vm.searchDescText.toLowerCase()) !== -1) {
                return list;
            }
        }

        function clearAllFilters() {
            vm.searchBy = {};
            vm.date.toDate = "";
            vm.date.fromDate = "";
            vm.searchDescText = "";
            vm.filterBy = "clusterName";
            vm.severity = "";
            vm.filterPlaceholder = "Cluster name";
            vm.filterByValue = "Cluster";
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
