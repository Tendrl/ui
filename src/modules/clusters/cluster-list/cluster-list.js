(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("clusterList", {

            restrict: "E",
            templateUrl: "/modules/clusters/cluster-list/cluster-list.html",
            bindings: {},
            controller: clusterController,
            controllerAs: "clusterCntrl"
        });

    /*@ngInject*/
    function clusterController($scope, $state, $interval, $rootScope, $uibModal, $filter, config, clusterStore, Notifications, utils, nodeStore) {

        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            clusterListTimer,
            hostList,
            i,
            filteredClusterList;

        vm.isDataLoading = true;
        vm.clusterNotPresent = false;
        vm.flag = false;
        vm.enProfilingBtnClicked = false;
        vm.disProfilingBtnClicked = false;
        $rootScope.selectedClusterOption = "allClusters";
        vm.filtersText = "";
        vm.filters = [];
        vm.clusterList = [];
        vm.filteredClusterList = [];
        vm.goToImportFlow = goToImportFlow;
        vm.doProfilingAction = doProfilingAction;
        vm.redirectToGrafana = redirectToGrafana;
        vm.addTooltip = addTooltip;
        vm.goToTaskDetail = goToTaskDetail;
        vm.showImportBtn = showImportBtn;
        vm.showDashboardBtn = showDashboardBtn;
        vm.showKebabMenu = showKebabMenu;
        vm.disableImportBtn = disableImportBtn;
        vm.getClass = getClass;
        vm.hideExpandBtn = hideExpandBtn;
        vm.goToClusterHost = goToClusterHost;
        vm.showViewDetailsLink = showViewDetailsLink;
        vm.showDisableLink = showDisableLink;
        vm.showEnableLink = showEnableLink;
        vm.getTemplate = getTemplate;
        vm.closeModal = closeModal;
        vm.getTooltip = getTooltip;

        vm.filterConfig = {
            fields: [{
                id: "name",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "",
                title: "",
                placeholder: "",
                filterType: ""
            }],
            appliedFilters: [],
            onFilterChange: _filterChange,
        };

        vm.sortConfig = {
            fields: [{
                id: "name",
                title: "Name",
                sortType: "alpha"
            }, {
                id: "status",
                title: "Status",
                sortType: "alpha"
            }, {
                id: "sdsVersion",
                title: "Cluster Version",
                sortType: "alpha"
            }, {
                id: "managed",
                title: "Managed",
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

        init();

        /*BEGIN Unmanage confirm modal*/
        vm.openUnmanageModal = openUnmanageModal;
        vm.unmanageModalId = "unmanageModal";
        vm.unmanageModalTitle = "Unmanage Cluster";
        vm.unmanageTemplate = "/modules/clusters/unmanage-cluster/unmanage-confirm/unmanage-confirm.html";
        vm.unmanageActionButtons = [{
            label: "Cancel",
            isCancel: true
        }, {
            label: "Unmanage",
            class: "btn-primary custom-class",
            actionFn: function() {
                vm.unmanageCluster.initiateUnmanage = true;
                _disableClickUnmanage(vm.unmanageCluster, true);
                clusterStore.doClusterUnmanage(vm.unmanageCluster.clusterId)
                    .then(function(data) {
                        vm.unmanageCluster.initiateUnmanage = false;
                        vm.unmanageCluster.jobId = data.job_id;
                        openUnmanageProgress(vm.unmanageCluster);
                        _disableClickUnmanage(vm.unmanageCluster, true);
                    }).catch(function(error) {
                        Notifications.message("danger", "", "Failed to initiate unmanage");
                        _disableClickUnmanage(vm.unmanageCluster, false);
                    });
            }
        }];

        function openUnmanageModal(cluster) {
            vm.unmanageCluster = {};
            cluster.showUnmanageModal = true;
            vm.unmanageCluster = cluster;
        }

        /*END Unmanage confirm modal*/

        /*BEGIN Unmanage progress modal*/
        vm.openUnmanageProgress = openUnmanageProgress;
        vm.unmanageProgressId = "unmanageModal";
        vm.unmanageProgressTitle = "Unmanage Cluster";
        vm.unmanageProgressTemplate = "/modules/clusters/unmanage-cluster/unmanage-progress/unmanage-progress.html";
        vm.unmanageProgressActionButtons = [{
            label: "View Task Progress",
            class: "btn-primary custom-class",
            actionFn: function() {
                if (vm.unmanageCluster.clusterId) {
                    vm.unmanageCluster.showUnmanageProgress = false;
                    $state.go("global-task-detail", { clusterId: vm.unmanageCluster.clusterId, taskId: vm.unmanageCluster.jobId });
                }
            }

        }];

        function openUnmanageProgress(cluster) {
            vm.unmanageCluster = cluster;
            cluster.showUnmanageProgress = true;
        }

        /*END Unmanage progress modal*/

        /*BEGIN Host modal*/
        vm.openHostModal = openHostModal;
        vm.hostModalId = "hostModal";
        vm.hostModalTemplate = "/modules/clusters/host-list-modal/host-list-modal.html";
        vm.hostModalActionButtons = [{
            label: "Close",
            isCancel: true
        }];

        function openHostModal(cluster) {
            cluster.showHost = true;
            vm.hostCluster = cluster;
            vm.hostCluster.hostList = cluster.hosts;
            vm.hostCluster.filteredHostList = cluster.hosts;
            vm.hostModalTitle = "Hosts on " + vm.hostCluster.name;
            vm.hostCluster.filterConfig = {
                fields: [{
                    id: "fqdn",
                    title: "Name",
                    placeholder: "Filter by Name",
                    filterType: "text"
                }, {
                    id: "ipAddress",
                    title: "Address",
                    placeholder: "Filter by IP Address",
                    filterType: "text"
                }],
                appliedHostFilters: [],
                onFilterChange: _filterHostChange,
            };

            vm.hostCluster.tableConfig = {
                selectionMatchProp: "fqdn",
                itemsAvailable: true,
                showCheckboxes: false
            };

            vm.hostCluster.tableColumns = [{
                header: "Host",
                itemField: "fqdn"
            }, {
                header: "Address",
                itemField: "ipAddress"
            }];

            vm.hostCluster.filterConfig.resultsCount = vm.hostCluster.filteredHostList.length;
        }

        /*END Host modal*/

        /*BEGIN expand modal*/
        vm.openExpandModal = openExpandModal;
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
                _disableClickExpand(vm.expandCluster, true);
                clusterStore.expandCluster(vm.expandCluster.clusterId)
                    .then(function(data) {
                        jobId = data.job_id;
                        _disableClickExpand(vm.expandCluster, true);
                        Notifications.message("success", "", "Successfully initiated expand cluster task");
                    }).catch(function(error) {
                        Notifications.message("danger", "", "Failed to initiate expand");
                        _disableClickExpand(vm.expandCluster, false);
                    });
                vm.expandCluster.showExpand = false;
            }

        }];

        function openExpandModal(cluster) {
            cluster.showExpand = true;
            vm.expandCluster = {};
            vm.expandCluster.disableExpand = false;
            vm.expandCluster = cluster;
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

        /*END expand modal*/

        function closeModal(cluster) {
            cluster.showHost = false;
            cluster.showUnmanageProgress = false;
            cluster.showUnmanageModal = false;
            cluster.showExpand = false;
        }

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf clusterController
         */
        function init() {
            clusterStore.selectedTab = 1;
            clusterStore.getClusterList()
                .then(function(data) {
                    $interval.cancel(clusterListTimer);

                    if (vm.clusterList.length) {
                        vm.clusterNotPresent = false;
                    }
                    vm.clusterList = data;
                    vm.filteredClusterList = vm.clusterList;
                    _filterChange(vm.filters);
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    startTimer();
                }).catch(function(e) {
                    vm.clusterList = [];
                    vm.filteredClusterList = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        /**
         * @name startTimer
         * @desc starts the timer after a given time interval to poll cluster data
         * @memberOf clusterController
         */
        function startTimer() {

            clusterListTimer = $interval(function() {
                init();
            }, 1000 * config.volumeRefreshInterval, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterListTimer);
        });

        /**
         * @name goToImportFlow
         * @desc takes user to import cluster flow
         * @memberOf clusterController
         */
        function goToImportFlow(cluster) {
            $state.go("import-cluster", { clusterId: cluster.integrationId });
        }

        function goToClusterHost(cluster) {
            $state.go("cluster-hosts", { clusterId: cluster.clusterId });
        }

        function redirectToGrafana(cluster) {
            utils.redirectToGrafana("glance", { clusterId: cluster.name });
        }

        /**
         * @name doProfilingAction
         * @desc enable/disable volume profile for cluster
         * @memberOf clusterController
         */
        function doProfilingAction($event, cluster, action, clusterId) {
            cluster.disableAction = true;
            clusterStore.doProfilingAction(cluster.clusterId, action)
                .then(function(data) {
                    Notifications.message("success", "", (action === "Enable" ? "Enable" : "Disable") + " volume profiling job initiated successfully.");
                    cluster.disableAction = true;
                    $interval.cancel(clusterListTimer);
                    startTimer();
                }).catch(function(error) {
                    Notifications.message("danger", "", "Failed to " + (action === "Enable" ? "enable" : "disable") + " volume profile.");
                    cluster.disableAction = false;
                });

            $event.stopPropagation();
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function goToTaskDetail(cluster) {
            if (cluster.jobType === "ExpandClusterWithDetectedPeers" || cluster.jobType === "EnableDisableVolumeProfiling") {
                $state.go("task-detail", { clusterId: cluster.integrationId, taskId: cluster.currentTaskId });
            } else {
                $state.go("global-task-detail", { clusterId: cluster.integrationId, taskId: cluster.currentTaskId });
            }
        }

        function showImportBtn(cluster) {
            return (cluster.managed === "No" && $rootScope.userRole !== "limited");
        }

        function disableImportBtn(cluster) {
            return (cluster.currentStatus === "in_progress" ||
                ((cluster.jobType === "UnmanageCluster" || cluster.jobType === "ImportCluster") && cluster.currentStatus === "failed"));
        }

        function showDashboardBtn(cluster) {
            return (cluster.managed === "Yes");
        }

        function showKebabMenu(cluster) {
            return (cluster.managed === "Yes" || cluster.currentStatus === "failed" ||
                    (cluster.jobType === "UnmanageCluster" && cluster.currentStatus === "in_progress")) &&
                $rootScope.userRole !== "limited";
        }

        function showViewDetailsLink(cluster) {
            return ((cluster.currentStatus === "in_progress" && cluster.jobType !== "EnableDisableVolumeProfiling") || cluster.currentStatus === "failed");
        }

        function hideExpandBtn(cluster) {

            return ($rootScope.userRole === "limited" || cluster.managed === "No" ||
                (cluster.managed === "Yes" && cluster.state !== "expand_pending" && !cluster.isAnyHostUnmanaged));
        }


        function getClass(cluster) {
            var cls;

            if (cluster.state === "expanding" && cluster.currentStatus === "in_progress" && cluster.jobType === "ExpandClusterWithDetectedPeers") {
                cls = "pficon pficon-in-progress";
            } else if (cluster.status === "HEALTH_ERR" || cluster.status === "HEALTH_WARN") {
                cls = "pficon pficon-warning-triangle-o";
            } else if (cluster.status === "HEALTH_OK") {
                cls = "pficon pficon-ok";
            } else if (cluster.managed !== "Yes") {
                cls = "fa ffont fa-question";
            }

            return cls;
        }

        function showDisableLink(cluster) {
            return cluster.isProfilingEnabled === "Enabled" ||
                cluster.isProfilingEnabled === "Mixed" ||
                cluster.isProfilingEnabled === "Unknown";
        }

        function showEnableLink(cluster) {
            return cluster.isProfilingEnabled === "Disabled" ||
                cluster.isProfilingEnabled === "Mixed" ||
                cluster.isProfilingEnabled === "Unknown";
        }

        function getTemplate(cluster) {
            var tooltip = {
                    "unmanagecluster": "If unmanage fails, resolve the issue and reinitiate unmanage cluster.",
                    "importcluster": "If import cluster fails, resolve the issue before performing an unmanage cluster and reinitiate import.",
                    "expandclusterwithdetectedpeers": "If cluster expansion fails, check if tendrl-ansible was executed successfully and ensure the node agents are correctly configured. If cluster expansion failed due to errors, resolve the errors on affected nodes and re-initiate the Expand Cluster action.",
                    "ready": "The cluster is successfully imported for viewing monitoring data and metrics."
                },
                template = "";

            if (cluster.currentStatus === "failed") {
                template = tooltip[cluster.jobType.toLowerCase()];

            } else if (cluster.readyState) {
                template = tooltip["ready"];
            }

            return template;
        }

        //Done this way since uib-tooltip-html doesn't update the content(https://github.com/angular-ui/bootstrap/issues/5931)
        function getTooltip(cluster) {
            return cluster.statusIcon;
        }

        /***Private Functions***/

        function _disableClickUnmanage(cluster, bool) {
            var i,
                len = vm.clusterList.length;

            for (i = 0; i < len; i++) {
                if (vm.clusterList[i] === cluster) {
                    vm.clusterList[i].disableUnmanage = bool;
                    break;
                }
            }
        }

        function _disableClickExpand(cluster, bool) {
            var i,
                len = vm.clusterList.length;

            for (i = 0; i < len; i++) {
                if (vm.clusterList[i] === cluster) {
                    vm.clusterList[i].disableExpand = bool;
                    break;
                }
            }
        }

        function _compareFn(item1, item2) {
            var compValue = 0;

            if (vm.sortConfig.currentField.id === "name") {
                compValue = item1.name.localeCompare(item2.name);
            } else if (vm.sortConfig.currentField.id === "status") {
                if (!item1.status) {
                    item1.status = "unmanaged";
                } else if (!item2.status) {
                    item2.status = "unmanaged";
                }
                compValue = item1.status.localeCompare(item2.status);
            } else if (vm.sortConfig.currentField.id === "sdsVersion") {
                compValue = item1.sdsVersion.localeCompare(item2.sdsVersion);
            } else if (vm.sortConfig.currentField.id === "managed") {
                compValue = item1.managed.localeCompare(item2.managed);
            }

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        }

        function _sortChange(sortId, isAscending) {
            vm.filteredClusterList.sort(_compareFn);
        }

        function _filterChange(filters) {
            _filterConf(filters, vm, "cluster");
        }

        function _filterHostChange(filters) {
            _filterConf(filters, vm.hostCluster, "host");
        }

        function _filterExpandChange(filters) {
            _filterConf(filters, vm.expandCluster, "expandHost");

        }

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "fqdn") {
                match = item.fqdn.match(re) !== null;
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

        function _applyFilters(filters, context, type) {

            context.filteredClusterList = [];
            if (filters && filters.length > 0) {
                context.clusterList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        context.filteredClusterList.push(item);
                    }
                });
            } else {
                context.filteredClusterList = context.clusterList;
            }
            context.filterConfig.resultsCount = context.filteredClusterList.length;
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

            if (type === "cluster") {
                _applyFilters(filters, context, type);
            } else if (type === "host" || type === "expandHost") {
                _applyHostFilters(filters, context, type);
            }
        }
    }

})();
