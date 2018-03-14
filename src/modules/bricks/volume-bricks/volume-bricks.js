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
        vm.filteredBrickList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.expandSubVolume = expandSubVolume;
        vm.closeExpandedView = closeExpandedView;
        vm.redirectToGrafana = redirectToGrafana;
        vm.addTooltip = addTooltip;
        vm.expandAll = expandAll;
        vm.collapseAll = collapseAll;
        vm.flag = false;

        vm.filterConfig = {
            fields: [{
                id: "fqdn",
                title: "Host Name",
                placeholder: "Filter by Host Name",
                filterType: "text"
            }, {
                id: "brickPath",
                title: "Brick Path",
                placeholder: "Filter by Brick Path",
                filterType: "text"
            }, {
                id: "status",
                title: "Brick Status",
                placeholder: "Filter by Brick Status",
                filterType: "select",
                filterValues: ["Started", "Stopped"]
            }, {
                id: "devices",
                title: "Disk Device Path",
                placeholder: "Filter by Brick Path",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

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
                            vm.filteredBrickList = vm.subVolumeList;
                            _filterChange(vm.filters);
                        }

                        vm.totalBrick = 0;
                        _getBricksCount();
                        startTimer();
                    });
            } else if (volumeStore.volumeList.length && !$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = clusterStore.formatClusterData(data);
                        brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId)
                            .then(function(data) {
                                $interval.cancel(volumeBrickTimer);
                                vm.isDataLoading = false;
                                if (vm.subVolumeList.length) {
                                    _mantainExpandedState(data);
                                } else {
                                    vm.subVolumeList = data;
                                    vm.filteredBrickList = vm.subVolumeList;
                                    _filterChange(vm.filters);
                                }

                                vm.totalBrick = 0;
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
                                    vm.filteredBrickList = vm.subVolumeList;
                                    _filterChange(vm.filters);
                                }

                                vm.totalBrick = 0;
                                _getBricksCount();
                                startTimer();
                            });
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = clusterStore.formatClusterData(data);;
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
                            vm.filteredBrickList = vm.subVolumeList;
                            _filterChange(vm.filters);
                        }

                        vm.totalBrick = 0;
                        _getBricksCount();
                        startTimer();
                    });
            }
        }

        function startTimer() {

            volumeBrickTimer = $interval(function() {
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

        function expandAll() {
            var len = vm.filteredBrickList.length,
                i;

            for (i = 0; i < len; i++) {
                vm.filteredBrickList[i].isExpanded = true;
            }
        }

        function collapseAll() {
            var len = vm.filteredBrickList.length,
                i;

            for (i = 0; i < len; i++) {
                vm.filteredBrickList[i].isExpanded = false;
            }
        }

        /***Private Functions***/


        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");
            var i;

            for (i = 0; i < item.bricks.length; i++) {
                if (filter.id === "fqdn") {
                    match = item.bricks[i].fqdn.match(re) !== null;
                } else if (filter.id === "brickPath") {
                    match = item.bricks[i].brickPath.match(re) !== null;
                } else if (filter.id === "status") {
                    match = item.bricks[i].status === filter.value.id || item.bricks[i].status.toLowerCase() === filter.value.toLowerCase();
                } else if (filter.id === "devices") {
                    match = item.bricks[i].devices[0].match(re) !== null;
                }
            }
            return match;
        }

        function _matchesFilters(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!_matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        }

        function _applyFilters(filters) {
            vm.filteredBrickList = [];
            vm.totalBrick = 0;
            if (filters && filters.length > 0) {
                vm.subVolumeList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredBrickList.push(item);
                    }
                });
            } else {
                vm.filteredBrickList = vm.subVolumeList;
            }
            vm.filterConfig.resultsCount = vm.filteredBrickList.length;
            _getBricksCount();
        }

        function _filterChange(filters) {
            vm.filtersText = "";
            vm.filters = filters;
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.filterCategory) {
                    vm.filtersText += ((filter.value.filterCategory.title || filter.value.filterCategory) +
                        filter.value.filterDelimiter + (filter.value.filterValue.title || filter.value.filterValue));
                } else if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });

            _applyFilters(filters);
        }

        function _getBricksCount() {
            var len = vm.filteredBrickList.length,
                i;

            for (i = 0; i < len; i++) {
                vm.totalBrick += vm.filteredBrickList[i].bricks.length;
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
    }

})();