(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("importCluster", {

            restrict: "E",
            templateUrl: "/modules/clusters/import-cluster/import-cluster.html",
            bindings: {
                cluster: "="
            },
            controller: importClusterController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function importClusterController($state, $rootScope, $stateParams, $uibModal, clusterStore) {

        var vm = this,
            hostList;

        vm.filtersText = "";
        vm.enableProfiling = "enable";
        vm.filterBy = "fqdn";
        vm.filterByValue = "Name";
        vm.filterPlaceholder = "Name";
        vm.taskInitiated = false;
        vm.importIcon = false;
        vm.hostList = [];
        vm.filteredHostList = [];
        vm.filters = [];
        vm.failedImport = false;
        vm.isDataLoading = true;
        vm.importCluster = importCluster;
        vm.importCancel = importCancel;
        vm.viewTaskProgress = viewTaskProgress;
        vm.openImportErrorModal = openImportErrorModal;

        vm.sortConfig = {
            fields: [{
                    id: "fqdn",
                    title: "Name",
                    sortType: "alpha"
                },
                {
                    id: "role",
                    title: "Role",
                    sortType: "alpha"
                }
            ],
            onSortChange: _sortChange
        };

        vm.filterConfig = {
            fields: [{
                id: "fqdn",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "role",
                title: "Role",
                placeholder: "Filter by Role",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: _filterChange,
        };

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf importClusterController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;

            if (!$rootScope.clusterData) {
                clusterStore.getClusterList()
                    .then(function(data) {
                        $rootScope.clusterData = clusterStore.formatClusterData(data);
                        _setImportDetail();
                        vm.filteredHostList = vm.hostList;
                        _filterChange(vm.filters);
                        _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    }).catch(function(e) {
                        vm.hostList = [];
                        vm.filteredHostList = vm.hostList;
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            } else {
                _setImportDetail();
                vm.filteredHostList = vm.hostList;
                vm.isDataLoading = false;
            }
        }

        function openImportErrorModal(taskId) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/import-cluster/import-fail/import-fail.html",
                controller: "importFailController",
                controllerAs: "vm",
                size: "lg",
                resolve: {
                    failedJob: function() {
                        return taskId;
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


        function _setImportDetail() {
            vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
            vm.hostList = vm.clusterObj.hosts;
            vm.taskId = vm.clusterObj.currentTaskId;
            vm.taskStatus = vm.clusterObj.currentStatus;
            if (vm.taskStatus === "failed") {
                vm.failedImport = true;
            }
        }

        function _compareFn(item1, item2) {
            var compValue = 0;
            if (vm.sortConfig.currentField.id === "fqdn") {
                compValue = item1.fqdn.localeCompare(item2.fqdn);
            } else if (vm.sortConfig.currentField.id === "role") {
                compValue = item1.role.localeCompare(item2.role);
            }

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        };

        function _sortChange(sortId, isAscending) {
            vm.hostList.sort(_compareFn);
        }


        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "fqdn") {
                match = item.fqdn.match(re) !== null;
            } else if (filter.id === "role") {
                match = item.role.match(re) !== null;
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

        /**
         * @name importCluster
         * @desc Perform import cluster
         * @memberOf importClusterController
         */
        function importCluster() {
            vm.importIcon = true;

            clusterStore.importCluster(vm.clusterId, vm.enableProfiling)
                .then(function(data) {
                    vm.taskInitiated = true;
                    vm.jobId = data.job_id;
                });

        }

        /**
         * @name importCancel
         * @desc Cancels import cluster
         * @memberOf importClusterController
         */
        function importCancel() {
            $state.go("clusters");
        }

        /**
         * @name viewTaskProgress
         * @desc redirect user to task detail page
         * @memberOf importClusterController
         */
        function viewTaskProgress() {

            if (vm.clusterId) {
                $state.go("global-task-detail", { clusterId: vm.clusterId, taskId: vm.jobId });
            }
        }

    }

})();