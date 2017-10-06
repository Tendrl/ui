(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("clusterDetail", {

            restrict: "E",
            templateUrl: "/modules/clusters/cluster-detail/cluster-detail.html",
            bindings: {},
            controller: clusterDetailController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function clusterDetailController($stateParams, $scope, $rootScope, $interval, utils, clusterStore, config) {

        var vm = this,
            clusterDetailTimer,
            alerts;


        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterDetailController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            $rootScope.isNavigationShow = true;

            if (!$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        _setClusterDetail();
                        _makeTabList();
                        vm.isDataLoading = false;
                    });
            } else {
                _setClusterDetail();
                _makeTabList();
                vm.isDataLoading = false;
            }
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterDetailTimer);
        });

        /**
         * @name setTab
         * @desc set tab for a cluster
         * @memberOf clusterDetailController
         */
        function setTab(newTab) {
            vm.activeTab = newTab;
            clusterStore.selectedTab = newTab;
        }

        /**
         * @name isTabSet
         * @desc check if the mentioned tab is set or not
         * @memberOf clusterDetailController
         */
        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

        /***Private Functions***/

        /**
         * @name _makeTabList
         * @desc returns tab list based on sds name
         * @memberOf clusterDetailController
         */
        function _makeTabList() {
            if (vm.clusterObj.sds_name === "gluster") {
                vm.tabList = {
                    "Hosts": 1,
                    "Volumes": 2
                };
            } else {
                vm.tabList = {
                    "Hosts": 1,
                    "Pools": 2,
                    "RBDs": 3
                };
            }
            if (!clusterStore.selectedTab) {
                vm.activeTab = vm.tabList["Hosts"];
            } else {
                vm.activeTab = clusterStore.selectedTab;
            }
        }

        /**
         * @name _setClusterDetail
         * @desc set cluster detail
         * @memberOf clusterDetailController
         */
        function _setClusterDetail() {
            vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
            vm.clusterName = vm.clusterObj.cluster_id || "NA";
            vm.clusterStatus = clusterStore.checkStatus(vm.clusterObj);
        }

        $scope.$on("GotClusterData", function(event, data) {
            var clusterData,
                len,
                i;

            if ($rootScope.clusterData !== null && typeof vm.clusterId !== "undefined") {
                clusterData = $rootScope.clusterData;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (clusterData[i].cluster_id === vm.clusterId) {
                        $rootScope.selectedClusterOption = clusterData[i].cluster_id;
                        break;
                    }
                }
            }
        });

    }

})();
