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
    function eventListController($rootScope, $scope, $interval, $state, $timeout, $filter, $stateParams, config, eventStore, utils) {

        var vm = this,
            eventTimer,
            toDate,
            count;

        vm.eventList = [];
        vm.isDataLoading = true;
        vm.searchDescText = "";
        vm.filterByCreatedDate = filterByCreatedDate;
        vm.searchByDesc = searchByDesc;
        vm.clearAllFilters = clearAllFilters;
        vm.openFromDate = openFromDate;
        vm.openToDate = openToDate;
        vm.showClearAction = showClearAction;

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

        function startEventTimer() {
            eventTimer = $interval(function() {
                init();
            }, 1000 * config.eventsRefreshIntervalTime, 1);
        }

        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;

            eventStore.getEventList(vm.clusterId)
                .then(function(list) {
                    $interval.cancel(eventTimer);
                    vm.eventList = list;
                    vm.isDataLoading = false;
                    startEventTimer();
                }).catch(function(e) {
                    vm.eventList = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }


        $scope.$on("$destroy", function() {
            $interval.cancel(eventTimer);
        });

        function openFromDate() {
            vm.popupFrom.opened = true;
        };

        function openToDate() {
            vm.popupTo.opened = true;
        };

        function filterByCreatedDate(list) {
            var dateList,
                dateTo,
                dateFrom;

            dateList = new Date(list.timeStamp);
            dateFrom = new Date(vm.date.fromDate);
            dateTo = new Date(vm.date.toDate);
            if (vm.date.fromDate && vm.date.toDate) {
                _checkValidDates();
                if (vm.date.fromDate.valueOf() === vm.date.toDate.valueOf()) {
                    return dateList.getDate() === dateTo.getDate();
                } else {
                    dateTo = dateTo.setDate(dateTo.getDate() +1);
                    return Date.parse(dateList) >= Date.parse(dateFrom) && Date.parse(dateList) <= dateTo ;
                }
            } else if (vm.date.fromDate) {
                return Date.parse(dateList) >= Date.parse(dateFrom);
            } else if (vm.date.toDate) {
                dateTo = dateTo.setDate(dateTo.getDate() +1);
                return Date.parse(dateList) <= dateTo;
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
            vm.date.toDate = null;
            vm.date.fromDate = null;
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

        function showClearAction() {
            return vm.date.fromDate || vm.date.toDate || vm.searchDescText;
        }
    }

})();
