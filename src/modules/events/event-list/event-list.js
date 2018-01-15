(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("eventList", {

            restrict: "E",
            templateUrl: "/modules/events/event-list/event-list.html",
            bindings: {},
            controller: eventListController,
            controllerAs: "eventListCntrl"
        });

    /*@ngInject*/
    function eventListController($rootScope, $scope, $interval, $state, $timeout, $filter, config, eventStore, utils) {

        var vm = this,
            eventTimer,
            toDate,
            count;

        vm.eventList = [];
        vm.isDataLoading = true;
        vm.searchDescText = "";
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.clearDate = clearDate;
        vm.searchByDesc = searchByDesc;
        vm.clearAllFilters = clearAllFilters;
        vm.resetCount = resetCount;
        count = 1;

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

        function startEventTimer() {
            eventTimer = $interval(function() {
                init();
            }, 1000 * config.eventsRefreshIntervalTime, 1);
        }

        function init() {
            eventStore.getEventList()
                .then(function(list) {
                    $interval.cancel(eventTimer);
                    vm.eventList = list;
                    vm.isDataLoading = false;
                    startEventTimer();
                });
        }


        $scope.$on("$destroy", function() {
            $interval.cancel(eventTimer);
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

        function clearDate(type) {
            if (type === "from") {
                vm.date.fromDate = "";
            } else if (type === "to") {
                vm.date.toDate = "";
            }
        }

        function clearAllFilters() {
            vm.date.toDate = "";
            vm.date.fromDate = "";
            vm.invalidToDate = false;
            vm.searchDescText = "";
        }

        function searchByDesc(list) {
            if (!vm.searchDescText) {
                return list;
            } else if (vm.searchDescText && (list.message.toLowerCase()).indexOf(vm.searchDescText.toLowerCase()) !== -1) {
                return list;
            }
        }
    }

})();
