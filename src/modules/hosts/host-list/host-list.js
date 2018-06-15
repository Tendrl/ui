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
    function hostController($scope, $rootScope, $state, $interval, $uibModal, utils, config, nodeStore, clusterStore) {
        var vm = this,
            clusterObj,
            hostListTimer;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.filtersText = "";
        vm.hostList = [];
        vm.filteredHostList = [];
        vm.filters = [];
        vm.hideExpandBtn = true;
        vm.expansionInProgress = false;

        vm.redirectToGrafana = redirectToGrafana;
        vm.goToHostDetail = goToHostDetail;
        vm.addTooltip = addTooltip;
        vm.getClass = getClass;
        vm.goToTaskDetail = goToTaskDetail;

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


        /*BEGIN expand modal*/
        vm.showExpand = false;
        vm.openExpandModal = openExpandModal;
        vm.closeExpandModal = closeExpandModal;
        vm.expandModalId = "expandModal";
        vm.expandModalTitle = "Expand Cluster";
        vm.expandModalTemplate = "/modules/clusters/expand-cluster/expand-cluster.html";
        vm.expandModalActionButtons = [{
                label: "Cancel",
                isCancel: true
            },
            {
                label: "Expand",
                class: "btn-primary custom-class",
                actionFn: function() {
                    var jobId;
                    vm.showExpand = true;
                    vm.cluster[vm.expandCluster].disableExpand = true;
                    vm.showExpand = false;
                    clusterStore.expandCluster(vm.expandCluster.clusterId)
                        .then(function(data) {
                            jobId = data.job_id;
                            vm.cluster[vm.expandCluster].disableExpand = true;
                            Notifications.message("success", "", "Successfully initiated expand cluster task");
                        }).catch(function(error) {
                            Notifications.message("danger", "", "Failed to initiate expand");
                            vm.cluster[vm.expandCluster].disableExpand = false;
                        });
                }

            }
        ];

        function openExpandModal() {
            vm.showExpand = true;
            vm.expandCluster = {};
            vm.expandCluster.disableExpand = false;
            vm.expandCluster = vm.cluster;
            vm.expandCluster.hostList = [];
            vm.expandCluster.filteredHostList = [];
            vm.expandCluster.filters = [];
            vm.expandCluster.isDataLoading = true;
            vm.expandCluster.filterConfig = {
                fields: [{
                    id: "name",
                    title: "Name",
                    placeholder: "Filter by Name",
                    filterType: "text"
                }, {
                    id: "ipAddress",
                    title: "Address",
                    placeholder: "Filter by IP Address",
                    filterType: "text"
                }],
                appliedFilters: [],
                onFilterChange: _filterChange,
            };

            vm.expandCluster.tableConfig = {
                selectionMatchProp: "name",
                itemsAvailable: true,
                showCheckboxes: false
            };

            vm.expandCluster.tableColumns = [{
                header: "Host",
                itemField: "name"
            }, {
                header: "Address",
                itemField: "ipAddress"
            }];

            nodeStore.getNodeList(vm.expandCluster.clusterId)
                .then(function(list) {
                    vm.expandCluster.hostList = $filter("filter")(list, { managed: "No" });
                    vm.expandCluster.filteredHostList = vm.expandCluster.hostList;
                    _filterChange(vm.expandCluster.filters);
                }).catch(function(e) {
                    vm.expandCluster.hostList = [];
                    vm.expandCluster.filteredHostList = vm.expandCluster.hostList;
                    _filterChange(vm.expandCluster.filters);
                }).finally(function() {
                    vm.expandCluster.isDataLoading = false;
                });
        }

        function closeExpandModal(dismissCause) {
            vm.showExpand = false;

        }

        //***Private Functions***

        function _matchesExpandFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.fqdn.match(re) !== null;
            } else if (filter.id === "ipAddress") {
                match = item.ipAddress.match(re) !== null;
            }
            return match;
        }

        function _matchesExpandFilters(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!_matchesExpandFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        }

        function _applyExpandFilters(filters) {
            vm.hostCluster.filtered = [];
            if (filters && filters.length > 0) {
                vm.hostCluster.hosts.forEach(function(item) {
                    if (_matchesExpandFilters(item, filters)) {
                        vm.hostCluster.filtered.push(item);
                    }
                });
            } else {
                vm.hostCluster.filtered = vm.hostCluster.hosts;
            }
            vm.hostCluster.filterConfig.resultsCount = vm.hostCluster.filtered.length;
        }

        function _filterExpandChange(filters) {
            vm.hostCluster.filtersText = "";
            vm.hostCluster.filters = filters;
            filters.forEach(function(filter) {
                vm.hostCluster.filtersText += filter.title + " : ";
                if (filter.value.title) {
                    vm.hostCluster.filtersText += filter.value.title;
                } else {
                    vm.hostCluster.filtersText += filter.value;
                }
                vm.hostCluster.filtersText += "\n";
            });
            _applyExpandFilters(filters);
        }

        //--------------------------------

        /*END expand modal*/

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostController
         */
        function init() {

            var clusters;
            clusters = $rootScope.clusterData;

            clusterStore.getCluster(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(hostListTimer);
                    vm.cluster = data;
                    _setExpansionState();
                    return nodeStore.getNodeList(vm.clusterId);
                }).catch(function(e) {
                    vm.cluster = {};
                })
                .then(function(list) {
                    vm.hostList = list;
                    vm.filteredHostList = vm.hostList;
                    _filterChange(vm.filters);
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    startTimer();
                }).catch(function(e) {
                    vm.hostList = [];
                    vm.filteredHostList = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        function startTimer() {

            hostListTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostListTimer);
        });

        function goToHostDetail(host) {
            if (vm.clusterId && host.managed === "Yes") {
                $state.go("host-detail", { clusterId: vm.clusterId, hostId: host.id });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function getClass(host) {
            var cls = "";

            if (host.managed === "No" && vm.cluster.state === "expanding") {
                cls = "pficon pficon-in-progress";
            } else if (host.managed === "No") {
                cls = "fa ffont fa-question";
            } else if (host.status === "DOWN") {
                cls = "fa ffont fa-arrow-circle-o-down";
            } else if (host.status === "UP") {
                cls = "pficon pficon-ok";
            }

            return cls;
        }

        function goToTaskDetail() {
            if (vm.cluster.jobType === "ExpandClusterWithDetectedPeers") {
                $state.go("task-detail", { clusterId: vm.cluster.integrationId, taskId: vm.cluster.currentTaskId });
            }
        }

        function startTimer() {

            hostListTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        function redirectToGrafana(host) {
            utils.redirectToGrafana("hosts", {
                clusterId: vm.cluster.name,
                hostName: host.name.split(".").join("_")
            });
        }

        function goToHostDetail(host) {
            if (vm.clusterId) {
                $state.go("host-detail", { clusterId: vm.clusterId, hostId: host.id });
            }
        }

        /***Private Functions****/

        function _hideExpandBtn() {
            return ($rootScope.userRole === "limited" ||
                (vm.cluster.managed === "Yes" && vm.cluster.state !== "expand_pending"));
        }

        function _setExpansionState() {
            vm.expansionInProgress = _isClusterExpanding();
            vm.hideExpandBtn = _hideExpandBtn();

            if (vm.expansionInProgress && vm.cluster.currentStatus === "in_progress") {
                vm.expansionMsg = "Expanding cluster."
            } else if (vm.expansionInProgress && vm.cluster.currentStatus === "failed") {
                vm.expansionMsg = "Expansion failed."
            } else if (!vm.hideExpandBtn) {
                vm.expansionMsg = "Cluster expansion required."
            }

            if (vm.expansionInProgress) {
                vm.hideExpandBtn = false;
            }
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
            vm.filteredHostList.sort(_compareFn);
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

        function _isClusterExpanding() {
            var expansionInProgress = false;
            if (vm.cluster.managed === "Yes") {
                if (vm.cluster.jobType === "ExpandClusterWithDetectedPeers" && (vm.cluster.currentStatus === "in_progress" || vm.cluster.currentStatus === "failed")) {
                    expansionInProgress = true;
                }
                return expansionInProgress;
            }
        }
    }
})();