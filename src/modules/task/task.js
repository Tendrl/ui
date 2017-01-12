(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("taskController", taskController);

    /*@ngInject*/
    function taskController($rootScope, $scope, $interval, utils, config) {

        var vm = this;
        vm.status = "In Progress";
        vm.init = init;
        $rootScope.isNavigationShow = true;

        function init() {
            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    if($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0){
                        vm.status = "Done";
                        /*Cancelling interval when scope is destroy*/
                        $scope.$on('$destroy', function() {
                            $interval.cancel(timer);
                        });
                    }
                });
        }

        /*Refreshing list after each 2 mins interval*/
        var timer = $interval(function () {
            vm.init();
        }, 1000 * config.refreshIntervalTime );       

        
    }

})();