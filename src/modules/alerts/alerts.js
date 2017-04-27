(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("alertController", alertController);

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
        vm.searchBy = {};

        vm.filterByCreatedDate = filterByCreatedDate;
        vm.resetCount = resetCount;
        vm.setSeverity = setSeverity;
        vm.filterBySeverity = filterBySeverity;
        vm.searchByDesc = searchByDesc;
        vm.clearAllFilters = clearAllFilters;
        vm.clearDate = clearDate;

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
                    vm.severityList = utils.getAlertSeverityList(vm.alertList);
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

        function filterByCreatedDate(list) {
            if(count === 1 && vm.date.fromDate && vm.date.toDate) {
                checkValidDates();
            }

            if(vm.date.fromDate && vm.date.toDate) {
                return Date.parse(list.timeStamp) >= Date.parse(vm.date.fromDate) 
                    && Date.parse(list.timeStamp) <= Date.parse(vm.date.toDate);
            } else if(vm.date.fromDate) {
                return Date.parse(list.timeStamp) >= Date.parse(vm.date.fromDate);
            } else if(vm.date.toDate) {
                return Date.parse(list.timeStamp) <= Date.parse(vm.date.toDate);
            } else {
                return list;
            }
        }

        function checkValidDates() {
            if(Date.parse(vm.date.toDate) < Date.parse(vm.date.fromDate)) {
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
            if(!vm.severity) {
                return list;
            } else if(list.severity === vm.severity) {
                return list;
            }
        }

        function setSeverity(value) {
            vm.severity = value;
        }

        function searchByDesc(list) {
            if(!vm.searchDescText) {
                return list;
            } else if(vm.searchDescText && (list.desc.toLowerCase()).indexOf(vm.searchDescText.toLowerCase()) !== -1) {
                return list;
            }
        }

        function clearAllFilters() {
           vm.searchBy[vm.filterBy] = "";
           vm.date.toDate = "";
           vm.date.fromDate = "";
           vm.searchDescText = "";
        }

        function clearDate(type) {
            if(type === "from") {
                vm.date.fromDate = "";
            } else if(type === "to") {
                vm.date.toDate = "";
            }   
        }
    }

})();