(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("taskDetailController", taskDetailController);

    /*@ngInject*/
    function taskDetailController($rootScope, $scope, $interval, $state, utils, config, $stateParams) {

        var vm = this,
            timer;

        vm.isDataLoading = true;
        vm.update = update;

        init();

        function init() {
            utils.getJobDetail($stateParams.taskId)
                .then(function(data) {
                    vm.taskDetail = data;
                    vm.isDataLoading = false;

                    utils.getTaskLogs("all")
                        .then(function(data) {

                            if(typeof vm.taskDetail !== "undefined") {
                                vm.taskDetail.logs = data;
                            }
                        });
                });
        }

        /*Refreshing list after each 2 mins interval*/
        timer = $interval(function () {
            init();
        }, 1000 * config.refreshIntervalTime );

        function update(dateType, val) {
            console.log(dateType, val);
        }    

    }

})();
