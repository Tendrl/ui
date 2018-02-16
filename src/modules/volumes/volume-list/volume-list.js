(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("volumeList", {

            restrict: "E",
            templateUrl: "/modules/volumes/volume-list/volume-list.html",
            bindings: {
                clusterId: "=?"
            },
            controller: volumeController,
            controllerAs: "volumeCntrl"
        });

    /*@ngInject*/
    function volumeController($scope, $rootScope, $state, $interval, utils, config, volumeStore) {
        var vm = this,
            volumeTimer,
            volumeList;

        vm.deleteFileShareStep = 1;
        vm.selectedFileShare = null;
        vm.isDataLoading = true;
        vm.flag = false;
        vm.volumeList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.isRebalanceAllowed = isRebalanceAllowed;
        vm.getRebalStatus = volumeStore.getRebalStatus;
        vm.redirectToGrafana = redirectToGrafana;
        vm.goToVolumeDetail = goToVolumeDetail;
        vm.addTooltip = addTooltip;
        vm.filteredVolumeList = [];

        vm.sortConfig = {
            fields: [{
                id: "name",
                title: "Name",
                sortType: "alpha"
            }, {
                id: "status",
                title: "Status",
                sortType: "alpha"
            }],
            onSortChange: _sortChange
        };

        vm.filterConfig = {
            fields: [{
                id: "name",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "status",
                title: "Status",
                placeholder: "Filter by Status",
                filterType: "select",
                filterValues: ["Started", "Stopped"]
            }, {
                id: "type",
                title: "Type",
                placeholder: "Filter by Type",
                filterType: "select",
                filterValues: ["Distribute", "Replicated", "Dispersed", "Distributed-Dispersed"]
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

        init();

        function init() {

            volumeStore.getVolumeList(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(volumeTimer);
                    vm.volumeList = data;
                    vm.filteredVolumeList = vm.volumeList;
                    _filterChange(vm.filters);
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function _compareFn(item1, item2) {
            var compValue = 0;
            if (vm.sortConfig.currentField.id === "name") {
                compValue = item1.name.localeCompare(item2.name);
            } else if (vm.sortConfig.currentField.id === "status") {
                compValue = item1.status.localeCompare(item2.status);
            }

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        }

        function _sortChange(sortId, isAscending) {
            vm.volumeList.sort(_compareFn);
        }

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "status") {
                match = item.status === filter.value.id || item.status === filter.value;
            } else if (filter.id === "type") {
                match = item["type"] === filter.value.id || item["type"].toLowerCase() === filter.value.toLowerCase();
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
            vm.filteredVolumeList = [];
            if (filters && filters.length > 0) {
                vm.volumeList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredVolumeList.push(item);
                    }
                });
            } else {
                vm.filteredVolumeList = vm.volumeList;
            }
            vm.filterConfig.resultsCount = vm.filteredVolumeList.length;
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

        function startTimer() {
            volumeTimer = $interval(function() {
                init();
            }, 1000 * config.refreshIntervalTime, 1);
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0) {
                $state.go("clusters");
            } else {
                init();
            }
        });

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(volumeTimer);
        });

        function redirectToGrafana(volume, $event) {
            utils.redirectToGrafana("volumes", $event, {
                clusterId: vm.clusterId,
                volumeName: volume.name
            });
        }

        function isRebalanceAllowed(volume) {
            return volume.type.startsWith("Distribute");
        }

        function goToVolumeDetail(volume) {
            if (vm.clusterId) {
                $state.go("volume-detail", { clusterId: vm.clusterId, volumeId: volume.volumeId });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

    }

})();