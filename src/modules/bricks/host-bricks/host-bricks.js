(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("hostBrickDetails", {

            restrict: "E",
            templateUrl: "/modules/bricks/host-bricks/host-bricks.html",
            bindings: {
                clusterId: "=",
                hostId: "="
            },
            controller: hostBrickController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function hostBrickController($scope, $rootScope, $state, $interval, $stateParams, config, brickStore, clusterStore, utils) {
        var vm = this,
            clusterObj,
            hostBrickTimer;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.brickList = [];
        vm.filteredBrickList = [];
        vm.filtersText = "";
        vm.filters = [];

        vm.redirectToGrafana = redirectToGrafana;
        vm.addTooltip = addTooltip;

        vm.filterConfig = {
            fields: [{
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
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostBrickController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.hostId = $stateParams.hostId;

            if ($rootScope.clusterData) {
                brickStore.getHostBrickList(vm.clusterId, vm.hostId)
                    .then(function(data) {
                        vm.brickList = data;
                        vm.filteredBrickList = vm.brickList;
                        _filterChange(vm.filters);
                        $interval.cancel(hostBrickTimer);
                        vm.isDataLoading = false;
                        startTimer();
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = clusterStore.formatClusterData(data);
                        brickStore.getHostBrickList(vm.clusterId, vm.hostId)
                            .then(function(data) {
                                vm.brickList = data;
                                vm.filteredBrickList = vm.brickList;
                                _filterChange(vm.filters);
                                $interval.cancel(hostBrickTimer);
                                _makeTabList();
                                vm.isDataLoading = false;
                                startTimer();
                            });
                    });
            }
        }

        function startTimer() {

            hostBrickTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        function redirectToGrafana(brick, $event) {
            var brickName = brick.brickPath.split(":")[1],
                hostName = brick.brickPath.split(":")[0].replace(/\./gi, "_");

            brickName = brickName.replace(/\//gi, "|");
            utils.redirectToGrafana("bricks", $event, { clusterId: vm.clusterId, hostName: hostName, brickName: brickName, volumeName: brick.volName });
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostBrickTimer);
        });

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        /*****Private Functions******/

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "brickPath") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "status") {
                match = item.status === filter.value.id || item.status.toLowerCase() === filter.value.toLowerCase();
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
            if (filters && filters.length > 0) {
                vm.brickList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredBrickList.push(item);
                    }
                });
            } else {
                vm.filteredBrickList = vm.brickList;
            }
            vm.filterConfig.resultsCount = vm.filteredBrickList.length;
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
    }

})();
