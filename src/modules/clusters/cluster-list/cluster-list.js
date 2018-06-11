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
    function clusterController($scope, $state, $interval, $rootScope, $uibModal, config, clusterStore, Notifications, utils) {

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
        vm.doClusterUnmanage = doClusterUnmanage;
        vm.redirectToGrafana = redirectToGrafana;
        vm.addTooltip = addTooltip;
        vm.openErrorModal = openErrorModal;
        vm.openHostModal = openHostModal;
        vm.goToTaskDetail = goToTaskDetail;
        vm.showImportBtn = showImportBtn;
        vm.showDashboardBtn = showDashboardBtn;
        vm.showKebabMenu = showKebabMenu;
        vm.disableImportBtn = disableImportBtn;
        vm.getClass = getClass;
        vm.expandCluster = expandCluster;
        vm.hideExpandBtn = hideExpandBtn;
        vm.isTooltipEnable = isTooltipEnable;
        vm.goToClusterHost = goToClusterHost;
        vm.showViewDetailsLink = showViewDetailsLink;
        vm.showDisableLink = showDisableLink;
        vm.showEnableLink = showEnableLink;

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
            onFilterChange: _filterChange
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

        function doClusterUnmanage(cluster) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/unmanage-cluster/unmanage-confirm/unmanage-confirm.html",
                controller: "unmanageConfirmController",
                controllerAs: "vm",
                size: "md",
                resolve: {
                    selectedCluster: function() {
                        return cluster;
                    }
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }

        function openErrorModal(cluster) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/cluster-error-list/cluster-error-list.html",
                controller: "errorListController",
                controllerAs: "vm",
                size: "lg",
                resolve: {
                    cluster: cluster
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }

        function openHostModal(cluster) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/host-list-modal/host-list-modal.html",
                controller: "hostModalController",
                controllerAs: "vm",
                size: "lg",
                resolve: {
                    cluster: cluster
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
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
                (cluster.managed === "Yes" && cluster.state !== "expand_pending"));
        }

        function isTooltipEnable(message) {
            return (message !== "Expansion required" && message !== "Expansion Failed" && message !== "Expanding cluster");
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

        function expandCluster(cluster) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/expand-cluster/expand-cluster.html",
                controller: "expandClusterController",
                controllerAs: "vm",
                size: "lg",
                resolve: {
                    selectedCluster: function() {
                        return cluster;
                    }
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
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

        /***Private Functions***/

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

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.name.match(re) !== null;
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
            vm.filteredClusterList = [];
            if (filters && filters.length > 0) {
                vm.clusterList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredClusterList.push(item);
                    }
                });
            } else {
                vm.filteredClusterList = vm.clusterList;
            }
            vm.filterConfig.resultsCount = vm.filteredClusterList.length;
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
    }

})();
