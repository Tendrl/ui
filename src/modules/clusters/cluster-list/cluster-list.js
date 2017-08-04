(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("clusterList", {

            restrict: "E",
            templateUrl: "/modules/clusters/cluster-list/cluster-list.html",
            bindings: {},
            controller: clusterController,
            controllerAs: "clusterCntrl"
        });

    /*@ngInject*/
    function clusterController($scope, $state, $interval, $rootScope, $filter, config, clusterStore) {

        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            clusterListTimer,
            hostList,
            i;

        vm.isDataLoading = true;
        vm.clusterNotPresent = false;
        vm.filterBy = "name";
        vm.orderBy = "name";
        vm.clusterList = [];

        vm.expandCluster = expandCluster;
        vm.closeExpandedView = closeExpandedView;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterController
         */
        function init() {
            clusterStore.getClusterList()
                .then(function(data) {
                    $interval.cancel(clusterListTimer);

                    if (vm.clusterList.length) {
                        _mantainExpandedState(data);
                    } else {
                        vm.clusterList = data;
                    }

                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0) {
                vm.clusterNotPresent = true;
            } else {
                init();
            }
        });

        /**
         * @name startTimer
         * @desc starts the timer after a given time interval to poll cluster data
         * @memberOf clusterController
         */
        function startTimer() {

            clusterListTimer = $interval(function() {
                init();
            }, 1000 * config.refreshIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterListTimer);
        });


        /**
         * @name expandCluster
         * @desc expands the cluster
         * @memberOf clusterController
         */
        function expandCluster($event, cluster) {
            if (cluster.isExpanded) {
                cluster.isExpanded = false;
            } else {
                cluster.isExpanded = true;
            }
             $event.stopPropagation();
        }

        /**
         * @name closeExpandedView
         * @desc closes the cluster
         * @memberOf clusterController
         */
        function closeExpandedView(cluster) {
            cluster.isExpanded = false;
        }


        /***Private Functions***/

        /**
         * @name _mantainExpandedState
         * @desc maintains the expanded state of cluster if polling refresh the cluster data
         * @memberOf clusterController
         */
        function _mantainExpandedState(data) {
            var clusterData = JSON.parse(JSON.stringify(vm.clusterList)),
                len = clusterData.length,
                cluster,
                expandedState,
                i;

            vm.clusterList = data;

            for (i = 0; i < len; i++) {
                cluster = _isClusterPresent(clusterData[i]);

                if (cluster !== -999) {
                    vm.clusterList[cluster.index].isExpanded = cluster.cluster.isExpanded;
                }
            }
        }

        /**
         * @name _isClusterPresent
         * @desc checks if cluster is present in vm.clusterList
         * @memberOf clusterController
         */
        function _isClusterPresent(cluster) {
            var len = vm.clusterList.length,
                found = false,
                i;

            for (i = 0; i < len; i++) {
                if (vm.clusterList[i].clusterId === cluster.clusterId) {
                    found = true;
                    return { index: i, cluster: cluster };
                }
            }

            if (found === false) {
                return -999;
            }

        }

    }

})();
