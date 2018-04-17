(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("clusterEvents", {

            restrict: "E",
            templateUrl: "/modules/clusters/cluster-events/cluster-events.html",
            bindings: {},
            controller: clusterEventsController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function clusterEventsController($stateParams, $scope, $rootScope, clusterStore) {

        var vm = this;
        vm.isDataLoading = true;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterEventsController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.selectedClusterOption = vm.clusterId;

            if (!$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        _setClusterDetail();
                        vm.isDataLoading = false;
                    });
            } else {
                _setClusterDetail();
                vm.isDataLoading = false;
            }
        }

        /***Private Functions***/

        /**
         * @name _setClusterDetail
         * @desc set cluster detail
         * @memberOf clusterDetailController
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
