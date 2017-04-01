(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("taskController", taskController);

    /*@ngInject*/
    function taskController($rootScope, $scope, $interval, $state, $timeout, $filter, config, taskStore) {

        var vm = this,
            timer,
            toDate;

        vm.goToTaskDetail = goToTaskDetail;
        vm.getStatusText = getStatusText;
        vm.updateStatus = updateStatus;
        vm.isSelectedStatus = isSelectedStatus;
        vm.filterByStatus = filterByStatus;
        vm.filterByCreatedDate = filterByCreatedDate;
        
        vm.tasksStatus = [];
        vm.isDataLoading = true;
        var count =1;

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
                    vm.taskList = data;
                    vm.isDataLoading = false;
                });
        }

        function goToTaskDetail(id) {
            $state.go("task-detail", {taskId: id});
        }

        function getStatusText(status) {

            if (status === "finished") {
                return "Completed";
            } else if (status === "failed") {
                return "Failed";
            } else if (status === "warning") {
                return "Completed with Errors";
            } else if (status === "in progress") {
                return "In Progress";
            }
        }

        // function _updateTaskStatus() {
        //     var len = vm.taskList.length,
        //         i,
        //         j,
        //         task;

        //     for( i = 0; i < len; i++) {
        //         (function(j) {
        //             //j = i;
        //             task = vm.taskList[j];
        //             taskStore.getTaskStatus(task.job_id)
        //                 .then(function(data) {
        //                     console.log(j);
        //                     task.status = data.status;
        //                     console.log(j, vm.taskList[j].status);
        //                 });
                
        //         })(i);
        //     }
        // }

        /*Refreshing list after each 2 mins interval*/
        timer = $interval(function () {
            init();
        }, 1000 * config.statusRefreshIntervalTime);

        $scope.$on("$destroy", function() {
            $interval.cancel(timer);
        });    

        function updateStatus(status) {
            var index;

            index = vm.tasksStatus.indexOf(status);

            if(index === -1) {
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
            
            if(vm.tasksStatus.length) {
                return vm.tasksStatus.indexOf(list.status) > -1;
            } else {
                return list;
            }
        }

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
