(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("volumeBrickDetails", {

            restrict: "E",
            templateUrl: "/modules/bricks/volume-bricks/volume-bricks.html",
            bindings: {
                clusterId: "=",
                volume: "="
            },
            controller: volumeBrickController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function volumeBrickController($scope, $rootScope, $state, $interval, $stateParams, config, utils, brickStore, clusterStore, volumeStore) {
        var vm = this,
            clusterObj,
            volumeBrickTimer;

        vm.isDataLoading = true;
        vm.totalBrick = 0;
        vm.subVolumeList = [];

        vm.expandSubVolume = expandSubVolume;
        vm.closeExpandedView = closeExpandedView;
        vm.redirectToGrafana = redirectToGrafana;
        vm.addTooltip = addTooltip;
        vm.clearAllFilters = clearAllFilters;
        vm.flag = false;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf volumeBrickController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.volumeId = $stateParams.volumeId;

            if ($rootScope.clusterData && volumeStore.volumeList.length) {
                brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId)
                    .then(function(data) {
                        $interval.cancel(volumeBrickTimer);
                        vm.isDataLoading = false;

                        if (vm.subVolumeList.length) {
                            _mantainExpandedState(data);
                        } else {
                            vm.subVolumeList = data;
                        }

                        _getBricksCount();
                        startTimer();
                    });
            } else if (volumeStore.volumeList.length && !$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId)
                            .then(function(data) {
                                $interval.cancel(volumeBrickTimer);
                                vm.isDataLoading = false;
                                if (vm.subVolumeList.length) {
                                    _mantainExpandedState(data);
                                } else {
                                    vm.subVolumeList = data;
                                }

                                _getBricksCount();
                                startTimer();
                            });
                    });
            } else if (!volumeStore.volumeList.length && $rootScope.clusterData) {
                volumeStore.getVolumeList(vm.clusterId)
                    .then(function(data) {
                        brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId)
                            .then(function(data) {
                                $interval.cancel(volumeBrickTimer);
                                vm.isDataLoading = false;
                                if (vm.subVolumeList.length) {
                                    _mantainExpandedState(data);
                                } else {
                                    vm.subVolumeList = data;
                                }

                                _getBricksCount();
                                startTimer();
                            });
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        return volumeStore.getVolumeList(vm.clusterId);
                    }).then(function(data) {
                        return brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId);
                    }).then(function(data) {
                        $interval.cancel(volumeBrickTimer);
                        vm.isDataLoading = false;
                        if (vm.subVolumeList.length) {
                            _mantainExpandedState(data);
                        } else {
                            vm.subVolumeList = data;
                        }

                        _getBricksCount();
                        startTimer();
                    });
            }
        }

        function startTimer() {

            volumeBrickTimer = $interval(function() {
                vm.totalBrick = 0;
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(volumeBrickTimer);
        });

        function expandSubVolume($event, subVolume) {
            if (subVolume.isExpanded) {
                subVolume.isExpanded = false;
            } else {
                subVolume.isExpanded = true;
            }
            $event.stopPropagation();
        }

        function closeExpandedView(subVolume) {
            subVolume.isExpanded = false;
        }

        function redirectToGrafana(brick, $event) {
            var brickName = brick.brickPath.split(":")[1],
                hostName = brick.fqdn.replace(/\./gi, "_");

            brickName = brickName.replace(/\//gi, "|");
            utils.redirectToGrafana("bricks", $event, { clusterId: vm.clusterId, hostName: hostName, brickName: brickName, volumeName: volumeStore.getVolumeObject(vm.volumeId).name });
        }

        /***Private Functions***/

        function _getBricksCount() {
            var len = vm.subVolumeList.length,
                i;

            for (i = 0; i < len; i++) {
                vm.totalBrick += vm.subVolumeList[i].bricks.length;
            }
        }

        function _mantainExpandedState(data) {
            var subVolData = JSON.parse(JSON.stringify(vm.subVolumeList)),
                len = subVolData.length,
                subVolume,
                expandedState,
                i;

            vm.subVolumeList = data;

            for (i = 0; i < len; i++) {
                subVolume = _isSubVolPresent(subVolData[i]);

                if (subVolume !== -999) {
                    vm.subVolumeList[subVolume.index].isExpanded = subVolume.subVolume.isExpanded;
                    vm.subVolumeList[subVolume.index].activeTab = subVolume.subVolume.activeTab;
                }
            }
        }

        function _isSubVolPresent(subVolume) {
            var len = vm.subVolumeList.length,
                found = false,
                i;

            for (i = 0; i < len; i++) {
                if (vm.subVolumeList[i].subVolumeName === subVolume.subVolumeName) {
                    found = true;
                    return { index: i, subVolume: subVolume };
                }
            }

            if (found === false) {
                return -999;
            }

        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function clearAllFilters() {
            //TODO: will be added in future
        }
    }

})();
