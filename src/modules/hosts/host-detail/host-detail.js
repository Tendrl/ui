(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("hostDetail", {

            restrict: "E",
            templateUrl: "/modules/hosts/host-detail/host-detail.html",
            bindings: {},
            controller: hostDetailController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function hostDetailController($stateParams, $scope, $rootScope, $interval, $state, brickStore, clusterStore, config, nodeStore) {

        var vm = this;

        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;


        vm.goToClusterHost = goToClusterHost;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostDetailController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.hostId = $stateParams.hostId;

            if ($rootScope.clusterData) {
                _makeTabList();
                vm.isDataLoading = false;
                vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
                vm.clusterName = vm.clusterObj.name || "NA";
                vm.clusterStatus = vm.clusterObj.status;
                if (!nodeStore.nodeList.length) {
                    nodeStore.getNodeList(vm.clusterId)
                        .then(function(data) {
                            vm.hostObj = nodeStore.getNodeObject(vm.hostId);
                            vm.hostName = vm.hostObj.name;
                            vm.hostStatus = vm.hostObj.status;
                            vm.isDataLoading = false;
                        });
                } else {
                    vm.hostObj = nodeStore.getNodeObject(vm.hostId);
                    vm.hostName = vm.hostObj.name;
                    vm.hostStatus = vm.hostObj.status;
                    vm.isDataLoading = false;
                }

            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        _makeTabList();
                        vm.isDataLoading = false;
                        vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
                        vm.clusterName = vm.clusterObj.name || "NA";
                        vm.clusterStatus = vm.clusterObj.status;
                        if (!nodeStore.nodeList.length) {
                            nodeStore.getNodeList(vm.clusterId)
                                .then(function(data) {
                                    vm.hostObj = nodeStore.getNodeObject(vm.hostId);
                                    vm.hostName = vm.hostObj.name;
                                    vm.hostStatus = vm.hostObj.status;
                                    vm.isDataLoading = false;
                                });
                        } else {
                            vm.hostObj = nodeStore.getNodeObject(vm.hostId);
                            vm.hostName = vm.hostObj.name;
                            vm.hostStatus = vm.hostObj.status;
                            vm.isDataLoading = false;
                        }
                    });
            }
        }

        /**
         * @name setTab
         * @desc set tab for a cluster
         * @memberOf hostDetailController
         */
        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        /**
         * @name isTabSet
         * @desc check if the mentioned tab is set or not
         * @memberOf hostDetailController
         */
        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }


        function goToClusterHost() {
            $state.go("cluster-hosts", { clusterId: vm.clusterId });
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

        /***Private Functions***/

        /**
         * @name _makeTabList
         * @desc returns tab list based on sds name
         * @memberOf hostDetailController
         */
        function _makeTabList() {
            vm.tabList = {
                "Bricks": 1
            };
            vm.activeTab = vm.tabList["Bricks"];
        }

    }

})();
