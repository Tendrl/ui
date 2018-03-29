(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("clusterVolumes", {

            restrict: "E",
            templateUrl: "/modules/clusters/cluster-volumes/cluster-volumes.html",
            bindings: {},
            controller: clusterVolumesController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function clusterVolumesController($stateParams, $scope, $rootScope, $interval, utils, clusterStore, config) {

        var vm = this,
            clusterDetailTimer,
            alerts;


        vm.isDataLoading = true;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterVolumesController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;

            if (!$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = clusterStore.formatClusterData(data);
                        _setClusterDetail();
                        vm.isDataLoading = false;
                    });
            } else {
                _setClusterDetail();
                vm.isDataLoading = false;
            }
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterDetailTimer);
        });

        /***Private Functions***/

        /**
         * @name _setClusterDetail
         * @desc set cluster detail
         * @memberOf clusterVolumesController
         */
        function _setClusterDetail() {
            vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
            vm.clusterName = vm.clusterObj.clusterId || "NA";
        }

        $scope.$on("GotClusterData", function(event, data) {
            var clusterData,
                len,
                i;

            if ($rootScope.clusterData !== null && typeof vm.clusterId !== "undefined") {
                clusterData = $rootScope.clusterData;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (clusterData[i].clusterId === vm.clusterId) {
                        $rootScope.selectedClusterOption = clusterData[i].clusterId;
                        break;
                    }
                }
            }
        });

    }

})();
