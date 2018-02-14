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

        vm.redirectToGrafana = redirectToGrafana;
        vm.goToHostDetail = goToHostDetail;
        vm.addTooltip = addTooltip;
        //vm.clearAllFilters = clearAllFilters;
        vm.sortConfig = {
            fields: [{
                id: 'name',
                title: 'Name',
                sortType: 'alpha'
            }],
            onSortChange: _sortChange
        };

        var matchesFilter = function(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, 'i');

            if (filter.id === 'name') {
                match = item.name.match(re) !== null;
            } else if (filter.id === 'status') {
        match = item.status === filter.value.id || item.status === filter.value;
      }
            return match;
        };

        var matchesFilters = function(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        };

        var applyFilters = function(filters) {
            vm.filteredHostList = [];
            if (filters && filters.length > 0) {
                vm.hostList.forEach(function(item) {
                    if (matchesFilters(item, filters)) {
                        vm.filteredHostList.push(item);
                    } 
                });
            } else {
                vm.filteredHostList = vm.hostList;
            }
            vm.filterConfig.resultsCount = vm.filteredHostList.length;
        };

        var filterChange = function(filters) {
            vm.filtersText = "";
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
            applyFilters(filters);
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
                filterValues: ["UP","DOWN"]
            }],
            resultsCount: vm.filteredHostList.length,
            totalCount: vm.hostList.length,
            appliedFilters: [],
            onFilterChange: filterChange
        };

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostController
         */
        function init() {

            var clusters;
            clusters = clusterStore.formatClusterData($rootScope.clusterData);

            nodeStore.getNodeList(vm.clusterId)
                .then(function(list) {
                    $interval.cancel(hostListTimer);
                    vm.hostList = list;
                    vm.filteredHostList = vm.hostList;
                    vm.filterConfig.resultsCount = vm.filteredHostList.length;
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    startTimer();
                }).catch(function(e) {
                    vm.hostList = [];
                    vm.filteredHostList = vm.hostList;
                    vm.filterConfig.resultsCount = vm.filteredHostList.length;
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        function _compareFn(item1, item2) {
            var compValue = 0;
            if (vm.sortConfig.currentField.id === "name") {
                compValue = item1.name.localeCompare(item2.name);
            }

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        };

        function _sortChange(sortId, isAscending) {
            vm.hostList.sort(_compareFn);
        };

        function startTimer() {

            hostListTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

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

/*        function clearAllFilters() {
            vm.searchBy = {};
            vm.filterBy = "name";
        }*/
    }

})();
