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
    function hostController($scope, $filter, $rootScope, $state, $interval, $uibModal, utils, config, nodeStore, clusterStore) {
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
        vm.expansionMsg = "";

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

        /*Begin Expand modal*/
        vm.showExpand = false;
        vm.openExpandModal = openExpandModal;
        vm.closeModal = closeModal;
        vm.expandModalId = "expandModal";
        vm.expandModalTitle = "Expand Cluster";
        vm.expandModalTemplate = "/modules/clusters/expand-cluster/expand-cluster.html";
        vm.expandModalActionButtons = [{
            label: "Cancel",
            isCancel: true
        }, {
            label: "Expand",
            class: "btn-primary custom-class",
            actionFn: function() {
                var jobId;
                vm.cluster.disableExpand = true;
                vm.showExpand = false;
                clusterStore.expandCluster(vm.expandCluster.clusterId)
                    .then(function(data) {
                        jobId = data.job_id;
                        vm.cluster.disableExpand = true;
                        vm.showExpand = false;
                        Notifications.message("success", "", "Successfully initiated expand cluster task");
                    }).catch(function(error) {
                        Notifications.message("danger", "", "Failed to initiate expand");
                        vm.showExpand = false;
                        vm.cluster.disableExpand = false;
                    });
            }

        }];

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
                onFilterChange: _filterExpandChange,
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
                    _filterExpandChange(vm.expandCluster.filters);
                }).catch(function(e) {
                    vm.expandCluster.hostList = [];
                    vm.expandCluster.filteredHostList = vm.expandCluster.hostList;
                    _filterExpandChange(vm.expandCluster.filters);
                }).finally(function() {
                    vm.expandCluster.isDataLoading = false;
                });
        }

        function closeModal(dismissCause) {
            vm.showExpand = false;
        }

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
            $rootScope.selectedClusterOption = vm.clusterId;

            clusterStore.getCluster(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(hostListTimer);
                    vm.cluster = data;
                    return nodeStore.getNodeList(vm.clusterId, vm.cluster.state);
                }).catch(function(e) {
                    vm.cluster = {};
                })
                .then(function(list) {
                    vm.hostList = list;
                    vm.filteredHostList = vm.hostList;
                    _setExpansionState();
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

        function _filterChange(filters) {
            _filterConf(filters, vm, "host");
        }

        function _filterExpandChange(filters) {
            _filterConf(filters, vm.expandCluster, "expandHost");
        }

        function _hideExpandBtn() {
            return ($rootScope.userRole === "limited" ||
                (vm.cluster.managed === "Yes" && vm.cluster.state !== "expand_pending" && !vm.cluster.isAnyHostUnmanaged));
        }

        function _setExpansionState() {
            vm.expansionInProgress = _isClusterExpanding();
            vm.hideExpandBtn = _hideExpandBtn();

            if (vm.expansionInProgress && vm.cluster.currentStatus === "in_progress") {
                vm.expansionMsg = "Expanding cluster.";
            } else if (vm.cluster.jobType === "ExpandClusterWithDetectedPeers" && vm.cluster.currentStatus === "failed") {
                vm.expansionMsg = "Expansion failed.";
            } else if (!vm.hideExpandBtn) {
                vm.expansionMsg = "Cluster expansion required.";
            }

            if (vm.expansionInProgress) {
                vm.hideExpandBtn = false;
            }

            //TODO: Remove this once backend handles it
            if (vm.cluster.jobType !== "ExpandClusterWithDetectedPeers" && vm.cluster.currentStatus === "in_progress") {
                vm.expansionInProgress = true;
            }

            if (!vm.hideExpandBtn && !vm.expansionMsg.length) {
                vm.expansionMsg = "Cluster expansion required.";
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
            } else if (filter.id === "ipAddress") {
                match = item.ipAddress.match(re) !== null;
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

        function _applyHostFilters(filters, context, type) {
            context.filteredHostList = [];
            if (filters && filters.length > 0) {
                context.hostList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        context.filteredHostList.push(item);
                    }
                });
            } else {
                context.filteredHostList = context.hostList;
            }
            context.filterConfig.resultsCount = context.filteredHostList.length;
        }

        function _filterConf(filters, context, type) {
            context.filtersText = "";
            context.filters = filters;
            filters.forEach(function(filter) {
                context.filtersText += filter.title + " : ";
                if (filter.value.title) {
                    context.filtersText += filter.value.title;
                } else {
                    context.filtersText += filter.value;
                }
                context.filtersText += "\n";
            });

            _applyHostFilters(filters, context, type);

        }

        function _isClusterExpanding() {
            var expansionInProgress = false;
            if (vm.cluster.managed === "Yes") {

                if (vm.cluster.jobType === "ExpandClusterWithDetectedPeers" && vm.cluster.currentStatus === "in_progress") {
                    expansionInProgress = true;
                }

                return expansionInProgress;
            }
        }
    }
})();
