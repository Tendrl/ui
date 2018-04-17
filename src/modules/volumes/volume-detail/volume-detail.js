(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("volumeDetail", {

            restrict: "E",
            templateUrl: "/modules/volumes/volume-detail/volume-detail.html",
            bindings: {},
            controller: volumeDetailController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function volumeDetailController($stateParams, $scope, $rootScope, $interval, $state, brickStore, clusterStore, volumeStore, config) {

        var vm = this;

        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;

        vm.goToClusterVolume = goToClusterVolume;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf volumeDetailController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.volumeId = $stateParams.volumeId;

            if ($rootScope.clusterData) {
                _makeTabList();

                vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
                vm.clusterName = vm.clusterObj.name || "NA";
                vm.clusterStatus = vm.clusterObj.status;
                if (!volumeStore.volumeList.length) {
                    volumeStore.getVolumeList(vm.clusterId)
                        .then(function(data) {
                            vm.volObj = volumeStore.getVolumeObject(vm.volumeId);
                            vm.volName = vm.volObj.name ? vm.volObj.name : vm.volumeId;
                            vm.volStatus = vm.volObj.status;
                            vm.isDataLoading = false;
                        });
                } else {
                    vm.volObj = volumeStore.getVolumeObject(vm.volumeId);
                    vm.volName = vm.volObj.name ? vm.volObj.name : vm.volumeId;
                    vm.volStatus = vm.volObj.status;
                    vm.isDataLoading = false;
                }


            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        _makeTabList();

                        vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
                        vm.clusterName = vm.clusterObj.name || "NA";
                        vm.clusterStatus = vm.clusterObj.status;
                        if (!volumeStore.volumeList.length) {
                            volumeStore.getVolumeList(vm.clusterId)
                                .then(function(data) {
                                    vm.volObj = volumeStore.getVolumeObject(vm.volumeId);
                                    vm.volName = vm.volObj.name ? vm.volObj.name : vm.volumeId;
                                    vm.volStatus = vm.volObj.status;
                                    vm.isDataLoading = false;
                                });
                        } else {
                            vm.volObj = volumeStore.getVolumeObject(vm.volumeId);
                            vm.volName = vm.volObj.name ? vm.volObj.name : vm.volumeId;
                            vm.volStatus = vm.volObj.status;
                            vm.isDataLoading = false;
                        }
                    });
            }
        }

        /**
         * @name setTab
         * @desc set tab for a cluster
         * @memberOf volumeDetailController
         */
        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        /**
         * @name isTabSet
         * @desc check if the mentioned tab is set or not
         * @memberOf volumeDetailController
         */
        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }


        function goToClusterVolume() {
            $state.go("cluster-volumes", { clusterId: vm.clusterId });
            //TODO: Remove this when UI will render navigation dynamically
            clusterStore.selectedTab = 2;
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
         * @memberOf volumeDetailController
         */
        function _makeTabList() {
            vm.tabList = {
                "Bricks": 1
            };
            vm.activeTab = vm.tabList["Bricks"];
        }

    }

})();
