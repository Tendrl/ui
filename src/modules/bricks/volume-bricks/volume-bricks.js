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
            volumeBrickTimer;

        vm.isDataLoading = true;
        vm.totalBrick = 0;
        vm.subVolumeList = [];
        vm.showExpansionWarn = false;
        vm.flag = false;
        vm.filteredBrickList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.expandSubVolume = expandSubVolume;
        vm.closeExpandedView = closeExpandedView;
        vm.expandAll = expandAll;
        vm.collapseAll = collapseAll;
        vm.removeErrMsg = removeErrMsg;

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
                id: "utilMoreThan",
                title: "Utilization More Than(%)",
                placeholder: "Filter by Utilization More Than(%)",
                filterType: "text"
            }, {
                id: "utilLessThan",
                title: "Utilization Less Than(%)",
                placeholder: "Filter by Utilization Less Than(%)",
                filterType: "text"
            }, {
                id: "devices",
                title: "Disk Device Path",
                placeholder: "Filter by Brick Path",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

        vm.volumeDetailConfig = {
            selectionMatchProp: "fqdn",
            itemsAvailable: true,
            showCheckboxes: false
        };

        vm.volumeDetailColumns = [{
            header: "Host Name",
            itemField: "fqdn"
        }, {
            header: "Brick Path",
            itemField: "brickPath",
            htmlTemplate: "/modules/bricks/volume-bricks/brick-path.html"
        }, {
            header: "Utilization",
            itemField: "utilization",
            htmlTemplate: "/modules/bricks/volume-bricks/utilization-path.html"
        }, {
            header: "Disk Device Path",
            itemField: "devices",
            templateFn: function(value, item) {
                return value[0];
            }
        }, {
            header: "Port",
            itemField: "port"
        }];

        vm.actionButtons = [{
            name: "Dashboard",
            title: "Dashboard",
            actionFn: _redirectToGrafana
        }];

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf volumeBrickController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.volumeId = $stateParams.volumeId;
            vm.clusterName = clusterStore.getClusterDetails(vm.clusterId).name;

            if ($rootScope.clusterData && volumeStore.volumeList.length) {
                clusterStore.getCluster(vm.clusterId)
                    .then(function(data) {

                        vm.cluster = data;
                        _setExpansionState();
                        return brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId);
                    }).catch(function(e) {

                        vm.cluster = {};
                        throw e;
                    }).then(function(data) {
                        $interval.cancel(volumeBrickTimer);
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
                    }).catch(function() {
                        vm.subVolumeList = [];
                        vm.filteredBrickList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            } else if (volumeStore.volumeList.length && !$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        return clusterStore.getCluster(vm.clusterId);
                    }).then(function(data) {

                        vm.cluster = data;
                        _setExpansionState();
                        return brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId);
                    }).catch(function(e) {
                        vm.cluster = {};
                        throw e;
                    }).then(function(data) {
                        $interval.cancel(volumeBrickTimer);
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
                    }).catch(function() {
                        vm.subVolumeList = [];
                        vm.filteredBrickList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            } else if (!volumeStore.volumeList.length && $rootScope.clusterData) {

                clusterStore.getCluster(vm.clusterId)
                    .then(function(data) {
                        vm.cluster = data;
                        _setExpansionState();
                        return volumeStore.getVolumeList(vm.clusterId);
                    }).catch(function(e) {

                        vm.cluster = {};
                        throw e;
                    }).then(function(data) {
                        return brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId);
                    }).then(function(data) {
                        $interval.cancel(volumeBrickTimer);
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
                    }).catch(function() {
                        vm.subVolumeList = [];
                        vm.filteredBrickList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        return clusterStore.getCluster(vm.clusterId);
                    }).then(function(data) {

                        vm.cluster = data;
                        _setExpansionState();
                        return volumeStore.getVolumeList(vm.clusterId);
                    }).catch(function(e) {

                        vm.cluster = {};
                    }).then(function(data) {
                        return brickStore.getVolumeBrickList(vm.clusterId, vm.volumeId);
                    }).then(function(data) {
                        $interval.cancel(volumeBrickTimer);
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
                    }).catch(function() {
                        vm.subVolumeList = [];
                        vm.filteredBrickList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
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

        function removeErrMsg() {
            var len = vm.filters.length,
                percentage,
                i;

            vm.errorMsg = "";

            for (i = 0; i < len; i++) {
                if (vm.filters[i].id === "utilMoreThan" || vm.filters[i].id === "utilLessThan") {
                    percentage = parseFloat(vm.filters[i].value);

                    if (percentage < 0 || percentage > 100 || isNaN(percentage)) {
                        vm.filters.splice(i, 1);
                        _filterChange(vm.filters);
                    }
                }
            }
        }

        /***Private Functions***/

        function _redirectToGrafana(action, brick) {
            var brickName = brick.brickPath.split(":")[1],
                hostName = brick.fqdn.replace(/\./gi, "_");

            brickName = brickName.replace(/\//gi, "|");
            utils.redirectToGrafana("bricks", { clusterId: vm.clusterName, hostName: hostName, brickName: brickName, volumeName: volumeStore.getVolumeObject(vm.volumeId).name });
        }

        function _matchesFilter(item, filter) {
            var bricks = [],
                subVol;

            item.bricks.forEach(function(brick) {
                if (_filterBrick(brick, filter)) {
                    bricks.push(brick);
                }
            });

            if (bricks.length) {
                item.bricks = bricks;
                subVol = item;
            } else {
                subVol = -9999;
            }

            return subVol;
        }

        function _filterBrick(brick, filter) {
            var match = false,
                percentage = 0,
                utilization = 0,
                re = new RegExp(filter.value, "i");

            if (filter.id === "fqdn") {
                match = brick.fqdn.match(re) !== null;
            } else if (filter.id === "brickPath") {
                //TODO: move this logic to store later on
                match = (brick.brickPath.split(":")[1]).match(re) !== null;
            } else if (filter.id === "status") {
                match = brick.status === filter.value.id || brick.status.toLowerCase() === filter.value.toLowerCase();
            } else if (filter.id === "devices") {
                match = brick.devices[0].match(re) !== null;
            } else if (filter.id === "utilMoreThan" || filter.id === "utilLessThan") {
                percentage = parseFloat(filter.value);
                utilization = parseFloat(brick.utilization.used);

                if (percentage >= 0 && percentage <= 100) {

                    if (filter.id === "utilMoreThan") {
                        match = (utilization > percentage);
                    } else if (filter.id === "utilLessThan") {
                        match = (utilization < percentage);
                    }
                }
            }

            return match;
        }

        function _validateFilter(filter) {
            var percentage,
                valid = true;

            if (filter.id === "utilMoreThan" || filter.id === "utilLessThan") {
                percentage = parseFloat(filter.value);

                if (percentage < 0 || percentage > 100 || isNaN(percentage)) {
                    vm.errorMsg = "Please enter a valid percentage.";
                    valid = false;
                }
            }

            return valid;
        }

        function _matchesFilters(item, filters) {
            var subVol,
                i,
                len = filters.length;

            for (i = 0; i < len; i++) {
                subVol = _matchesFilter(item, filters[i]);

                //if any filter criteria doesn't match, exit from the loop
                if (subVol === -9999) {
                    break;
                }
            }

            return subVol;
        }

        function _applyFilters(filters) {
            var subVol,
                list = JSON.parse(JSON.stringify(vm.subVolumeList));

            vm.filteredBrickList = [];
            vm.totalBrick = 0;

            if (filters && filters.length > 0) {
                list.forEach(function(item) {
                    subVol = _matchesFilters(item, filters);

                    if (subVol !== -9999) {
                        vm.filteredBrickList.push(subVol);
                    }
                });

            } else {
                vm.filteredBrickList = vm.subVolumeList;
            }

            vm.filterConfig.resultsCount = vm.filteredBrickList.length;
            _getBricksCount();
        }

        function _filterChange(filters) {
            var len = filters.length,
                valid = true,
                i;

            vm.filtersText = "";
            vm.filters = filters;

            filters.forEach(function(filter) {
                if (_validateFilter(filter)) {
                    vm.filtersText += filter.title + " : ";

                    if (filter.value.title) {
                        vm.filtersText += filter.value.title;
                    } else {
                        vm.filtersText += filter.value;
                    }

                    vm.filtersText += "\n";
                } else {
                    valid = false;
                    vm.filtersText = vm.filtersText.replace(filter.title + ": " + filter.value, "");
                    vm.filterConfig.appliedFilters.splice(brickStore.getFilterIndex(vm.filters, filter));
                }
            });

            if (valid) {
                _applyFilters(filters);
            }
        }

        function _setExpansionState() {
            vm.showExpansionWarn = false;

            if (vm.cluster.state === "expanding" || vm.cluster.state === "expand_pending") {
                vm.showExpansionWarn = true;
            }
        }

        function _getBricksCount() {
            var len = vm.filteredBrickList.length,
                i;

            for (i = 0; i < len; i++) {
                vm.totalBrick += vm.filteredBrickList[i].bricks.length;
            }
        }

        function _mantainExpandedState(data) {
            var subVolData = JSON.parse(JSON.stringify(vm.filteredBrickList)),
                len = subVolData.length,
                subVolume,
                i;

            vm.subVolumeList = data;
            vm.filteredBrickList = data;

            for (i = 0; i < len; i++) {
                subVolume = _isSubVolPresent(subVolData[i]);

                if (subVolume !== -999) {
                    vm.subVolumeList[subVolume.index].isExpanded = subVolume.subVolume.isExpanded;
                    vm.subVolumeList[subVolume.index].activeTab = subVolume.subVolume.activeTab;
                }
            }

            _filterChange(vm.filters);
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

    }

})();
