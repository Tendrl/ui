(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("hostList", {

            restrict: "E",
            templateUrl: "/modules/hosts/host-list/host-list.html",
            bindings: {
                clusterId: "=?"
            },
            controller: hostController,
            controllerAs: "hostCntrl"
        });

    /*@ngInject*/
    function hostController($scope, $rootScope, $state, $interval, utils, config, nodeStore, clusterStore) {
        var vm = this,
            clusterObj,
            hostListTimer;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.filtersText = "";
        vm.hostList = [];
        vm.filteredHostList = [];
        vm.filters = [];

        vm.redirectToGrafana = redirectToGrafana;
        vm.goToHostDetail = goToHostDetail;
        vm.addTooltip = addTooltip;
        //vm.clearAllFilters = clearAllFilters;
        vm.sortConfig = {
            fields: [{
                id: "name",
                title: "Name",
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
                id: "status",
                title: "Status",
                placeholder: "Filter by Status",
                filterType: "select",
                filterValues: ["UP", "DOWN"]
            }],
            appliedFilters: [],
            onFilterChange: _filterChange,
        };


        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostController
         */
        function init() {

            var clusters;
            clusters = $rootScope.clusterData;

            nodeStore.getNodeList(vm.clusterId)
                .then(function(list) {
                    $interval.cancel(hostListTimer);
                    vm.hostList = list;
                    vm.filteredHostList = vm.hostList;
                    _filterChange(vm.filters);
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    startTimer();
                }).catch(function(e) {
                    vm.hostList = [];
                    vm.filteredHostList = vm.hostList;
                    _filterChange(vm.filters);
                }).finally(function() {
                    vm.isDataLoading = false;
                });
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
            vm.hostList.sort(_compareFn);
        }

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "status") {
                match = item.status === filter.value.id || item.status === filter.value;
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
            vm.filteredHostList = [];
            if (filters && filters.length > 0) {
                vm.hostList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredHostList.push(item);
                    }
                });
            } else {
                vm.filteredHostList = vm.hostList;
            }
            vm.filterConfig.resultsCount = vm.filteredHostList.length;
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

        function startTimer() {

            hostListTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.length === 0) {
                $state.go("clusters");
            } else {
                init();
            }
        });

        function redirectToGrafana(host, $event) {
            utils.redirectToGrafana("hosts", $event, {
                clusterId: host.integrationId,
                hostName: host.name.split(".").join("_")
            });
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostListTimer);
        });

        function goToHostDetail(host) {
            if (vm.clusterId) {
                $state.go("host-detail", { clusterId: vm.clusterId, hostId: host.id });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }
    }

})();