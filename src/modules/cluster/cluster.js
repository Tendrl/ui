(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, utils, config) {
        var vm = this;

        vm.importCluster = importCluster;
        vm.init = init;
        vm.init();

        function init() {
            utils.getObjectList("Cluster").then(function(list) {
                vm.clusterList = [];
                if(list !== null) {
                    vm.clusterList = list;
                }
            });
        }

        /*Refreshing list after each 30 second interval*/
        var timer = $interval(function () {
          vm.init();
        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function importCluster() {
            $state.go("import-cluster");
        }
    }

})();