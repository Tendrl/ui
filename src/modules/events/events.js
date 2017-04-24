(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("eventController", eventController);

    /*@ngInject*/
    function eventController($rootScope, $scope, $interval, $state, $timeout, $filter, config, eventStore) {

        var vm = this,
            eventTimer,
            toDate,
            count;

        vm.getEventStatus = getEventStatus;
        vm.filterByCreatedDate = filterByCreatedDate;
        
        vm.eventStatus = [];
        vm.isDataLoading = true;
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

        function init() {
            eventStore.getEventList()
                .then(function(eventList) {
                    vm.isDataLoading = false;
                    $interval.cancel(eventTimer);
                    $rootScope.eventList = eventList;
                    vm.eventList = eventList;
                    startEventTimer();
                });
        }

        function startEventTimer() {

            eventTimer = $interval(function() {
                init();
            }, 1000 * config.eventsRefreshIntervalTime, 1);
        }

        function getEventStatus(status) {

            if (status === "error") {
                return "Error";
            } else if (status === "warning") {
                return "Warning";
            } else if (status === "info") {
                return "Info";
            }
        }

        $scope.$on("$destroy", function() {
            $interval.cancel(startEventTimer);
        });

        function filterByCreatedDate(list) {
            if(count === 1) {
                checkValidDates();
            }

            if(vm.date.fromDate && vm.date.toDate) {
                return Date.parse(list.created_at) >= Date.parse(vm.date.fromDate) 
                    && Date.parse(list.created_at) <= Date.parse(vm.date.toDate);
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

        vm.resetCount = function() {
            count = 1;
        };
    }

})();