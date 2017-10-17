(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("hostBrickDetails", {

            restrict: "E",
            templateUrl: "/modules/bricks/host-bricks/host-bricks.html",
            bindings: {
                clusterId: "=",
                hostId: "="
            },
            controller: hostBrickController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function hostBrickController($scope, $rootScope, $state, $interval, $stateParams, config, brickStore, clusterStore, utils) {
        var vm = this,
            clusterObj,
            hostBrickTimer;

        vm.isDataLoading = true;
        vm.brickList = [];
        vm.redirectToGrafana = redirectToGrafana;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostBrickController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.hostId = $stateParams.hostId;

            if ($rootScope.clusterData) {
                brickStore.getHostBrickList(vm.clusterId, vm.hostId)
                    .then(function(data) {
                        vm.brickList = data;
                        $interval.cancel(hostBrickTimer);
                        vm.isDataLoading = false;
                        startTimer();
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        brickStore.getHostBrickList(vm.clusterId, vm.hostId)
                            .then(function(data) {
                                vm.brickList = data;
                                $interval.cancel(hostBrickTimer);
                                _makeTabList();
                                vm.isDataLoading = false;
                                startTimer();
                            });
                    });
            }
        }

        function startTimer() {

            hostBrickTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        function redirectToGrafana(brick, $event) {
            var brickName = brick.brickPath.split(":")[1],
                hostName = brick.brickPath.split(":")[0].replace(/\./gi, "_");

            brickName = brickName.replace(/\//gi, "|");
            utils.redirectToGrafana("bricks", $event, { clusterId: vm.clusterId, hostName: hostName, brickName: brickName, volumeName: brick.volName});
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostBrickTimer);
        });
    }

})();
