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
    function volumeController($scope, $rootScope, $state, $interval, utils, config, volumeStore, Notifications, clusterStore) {
        var vm = this,
            volumeTimer,
            volumeList;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.volumeList = [];
        vm.filteredVolumeList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.getRebalStatus = volumeStore.getRebalStatus;
        vm.redirectToGrafana = redirectToGrafana;
        vm.goToVolumeDetail = goToVolumeDetail;
        vm.addTooltip = addTooltip;
        vm.toggleProfiling = toggleProfiling;
        vm.goToTaskDetail = goToTaskDetail;
        vm.showDisableBtn = showDisableBtn;
        vm.showEnableBtn = showEnableBtn;
        vm.getVolumeIcon = getVolumeIcon;
        vm.getVolState = getVolState;

        vm.sortConfig = {
            fields: [{
                id: "name",
                title: "Name",
                sortType: "alpha"
            }, {
                id: "state",
                title: "State",
                sortType: "alpha"
            }],
            onSortChange: _sortChange,
            currentField: {
                id: "name",
                title: "Name",
                sortType: "alpha"
            },
            isAscending: true
        };

        vm.filterConfig = {
            fields: [{
                id: "name",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "state",
                title: "State",
                placeholder: "Filter by State",
                filterType: "select",
                filterValues: ["Up", "Down", "Partial", "Degraded", "Unknown"]
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
            vm.clusterName = clusterStore.getClusterDetails(vm.clusterId).name;

            volumeStore.getVolumeList(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(volumeTimer);
                    vm.volumeList = data;
                    vm.filteredVolumeList = vm.volumeList;
                    _filterChange(vm.filters);
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    startTimer();
                }).catch(function(e) {
                    vm.volumeList = [];
                    vm.filteredVolumeList = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        function toggleProfiling(volume, action, $event) {
            volume.disableAction = true;
            volumeStore.toggleProfiling(volume, action, vm.clusterId)
                .then(function(data) {
                    Notifications.message("success", "", (action === "enable" ? "Enable" : "Disable") + " volume profiling job initiated successfully.");
                    volume.disableAction = true;
                    $interval.cancel(volumeTimer);
                    startTimer();
                }).catch(function() {
                    Notifications.message("danger", "", "Failed to " + (action === "enable" ? "enable" : "disable") + " volume profile.");
                    volume.disableAction = false;
                });

            $event.stopPropagation();
        }

        function getVolumeIcon(state) {
            
            var cls;
            cls = "fa ffont fa-question";

            if (state.indexOf("up") !== -1) {
                cls = "pficon pficon-ok";
            } else if (state.indexOf("down") !== -1) {
                cls = "fa ffont fa-arrow-circle-o-down";
            } else if (state.indexOf("partial") !== -1) {
                cls = "pficon pficon-degraded icon-red";
            } else if (state.indexOf("degraded") !== -1) {
                cls = "pficon pficon-degraded icon-orange";
            } else if (state.indexOf("unknown") !== -1) {
                cls = "fa ffont fa-question";
            }

            return cls;
        }

        function getVolState(state) {
            var cls;

            if (state.indexOf("up") !== -1) {
                cls = "Up";
            } else if (state.indexOf("down") !== -1) {
                cls = "Down";
            } else if (state.indexOf("partial") !== -1) {
                cls = "Partial";
            } else if (state.indexOf("degraded") !== -1) {
                cls = "Degraded";
            } else if (state.indexOf("unknown") !== -1) {
                cls = "Unknown";
            }

            return cls;
        }

        function goToTaskDetail(volume) {
            $rootScope.selectedClusterOption = vm.clusterId;
            $state.go("task-detail", { clusterId: vm.clusterId, taskId: volume.currentTask.job_id });
        }

        function startTimer() {
            volumeTimer = $interval(function() {
                init();
            }, 1000 * config.volumeRefreshInterval, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(volumeTimer);
        });

        function redirectToGrafana(volume) {
            utils.redirectToGrafana("volumes", {
                clusterId: vm.clusterName,
                volumeName: volume.name
            });
        }

        function goToVolumeDetail(volume) {
            if (vm.clusterId) {
                $state.go("volume-detail", { clusterId: vm.clusterId, volumeId: volume.volumeId });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function showDisableBtn(volume) {
            return (volume.profileStatus === "Enabled" ||
                (volume.currentTask.job_name === "StopProfiling" &&
                    volume.currentTask.status === "in_progress")) && ($rootScope.userRole !== "limited");
        }

        function showEnableBtn(volume) {
            return (volume.profileStatus === "Disabled" ||
                (volume.currentTask.job_name === "StartProfiling" &&
                    volume.currentTask.status === "in_progress")) && ($rootScope.userRole !== "limited");
        }

        /*****Private Functions******/

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");
            if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "state") {
                match = item.state.indexOf(filter.value.toLowerCase()) !== -1 || item.state.indexOf(filter.value.toLowerCase()) !== -1;
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
                if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });

            _applyFilters(filters);
        }

        function _compareFn(item1, item2) {
            var compValue = 0,
                sortId = vm.sortConfig.currentField.id;

            compValue = item1[sortId].localeCompare(item2[sortId]);

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        }

        function _sortChange(sortId, isAscending) {
            vm.filteredVolumeList.sort(_compareFn);
        }

    }

})();