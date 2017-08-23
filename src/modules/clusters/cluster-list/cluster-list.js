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
        vm.goToImportFlow = goToImportFlow;
        vm.goToClusterDetail = goToClusterDetail;
        vm.showKababMenu = showKababMenu;
        vm.doProfilingAction = doProfilingAction;
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterController
         */
        function init() {
            clusterStore.getClusterList()
                .then(function(data) {
                    data = clusterStore.formatClusterData(data);
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
            if ($rootScope.clusterData === null || $rootScope.clusterData.length === 0) {
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

        /**
         * @name goToImportFlow
         * @desc takes user to import cluster flow
         * @memberOf clusterController
         */
        function goToImportFlow(cluster) {
            $rootScope.clusterTobeImported = cluster;
            $state.go("import-cluster", { clusterId: cluster.cluster_id });
        }

        /**
         * @name goToClusterDetail
         * @desc takes user to cluster detail page
         * @memberOf clusterController
         */
        function goToClusterDetail(cluster) {
            $state.go("cluster-detail", { clusterId: cluster.clusterId });
        }

        /**
         * @name showKababMenu
         * @desc hide/show kabab menu
         * @memberOf clusterController
         */
        function showKababMenu($event, cluster) {
            if (cluster.isKababOpened) {
                cluster.isKababOpened = false;
            } else {
                cluster.isKababOpened = true;
            }
            $event.stopPropagation();
        }

        /**
         * @name doProfilingAction
         * @desc enable/disable volume profile for cluster
         * @memberOf clusterController
         */
        function doProfilingAction($event, cluster, action) {
            clusterStore.doProfilingAction(cluster.clusterId, action)
                .then(function(data) {
                    $rootScope.notification.type = "success";
                    $rootScope.notification.message = "Volume profiling updated successfully.";
                }).catch(function(error) {
                    $rootScope.notification.type = "error";
                    $rootScope.notification.message = "Failed to update volume profile.";
                });
            $event.stopPropagation();
        }

        /**
         * @name setTab
         * @desc set tab for a cluster
         * @memberOf clusterController
         */
        function setTab(cluster, newTab) {
            cluster.activeTab = newTab;
        }

        /**
         * @name isTabSet
         * @desc check if the mentioned tab is set or not
         * @memberOf clusterController
         */
        function isTabSet(cluster, tabNum) {
            return cluster.activeTab === tabNum;
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
                    vm.clusterList[cluster.index].activeTab = cluster.cluster.activeTab;
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
