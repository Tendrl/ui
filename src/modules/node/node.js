(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("nodeController", nodeController);

    /*@ngInject*/
    function nodeController($scope, $interval, utils, config) {
        var vm = this;

        vm.init = init;
        vm.init();

        function init() {
            utils.getObjectList("Node").then(function(list) {
                vm.nodeList = [];
                if(list !== null) {
                    vm.nodeList = list;
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
    }

})();
