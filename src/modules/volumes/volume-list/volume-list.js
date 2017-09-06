(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("volumeList", {

            restrict: "E",
            templateUrl: "/modules/volumes/volume-list/volume-list.html",
            bindings: {
                clusterId: "=?"
            },
            controller: volumeController,
            controllerAs: "volumeCntrl"
        });

    /*@ngInject*/
    function volumeController($scope, $rootScope, $state, $interval, utils, config, volumeStore) {
        var vm = this,
            volumeTimer,
            volumeList;

        vm.deleteFileShareStep = 1;
        vm.selectedFileShare = null;
        vm.isDataLoading = true;
        vm.isRebalanceAllowed = isRebalanceAllowed;
        vm.getRebalStatus = volumeStore.getRebalStatus;
        vm.redirectToGrafana = redirectToGrafana;

        init();

        function init() {
            volumeStore.getVolumeList(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(volumeTimer);
                    vm.volumeList = data;
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function startTimer() {
            volumeTimer = $interval(function() {
                init();
            }, 1000 * config.refreshIntervalTime, 1);
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            /* Forward to home view if we don't have any cluster */    
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("clusters");
            }else {
                init();
            }
        });

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(volumeTimer);
        });

        function redirectToGrafana(volume, $event){
            utils.redirectToGrafana("volumes", $event, {clusterId: vm.clusterId,
                                                        volumeName: volume.name});
        }

        function isRebalanceAllowed(volume) {
            return volume.type.startsWith("Distribute");
        }
    }

})();
