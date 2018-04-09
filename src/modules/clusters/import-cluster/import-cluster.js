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

        vm.clusterNamePattern = /^[a-zA-Z0-9][A-Za-z0-9_]*$/i;
        vm.filtersText = "";
        vm.clusterName = "";
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

        vm.filterConfig = {
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
            appliedFilters: [],
            onFilterChange: _filterChange,
        };


        vm.tableConfig = {
            selectionMatchProp: "fqdn",
            itemsAvailable: true,
            showCheckboxes: false
        };

        vm.tableColumns = [
            { header: "Host", itemField: "fqdn" },
            { header: "Address", itemField: "ipAddress" }

        ];

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

        /**
         * @name importCluster
         * @desc Perform import cluster
         * @memberOf importClusterController
         */
        function importCluster() {
            var clusterName;

            if (vm.clusterName) {
                clusterName = vm.clusterName.match(vm.clusterNamePattern);
            }

            if (clusterName !== null) {
                vm.importIcon = true;
                clusterStore.importCluster(vm.clusterId, vm.enableProfiling, vm.clusterName)
                    .then(function(data) {
                        vm.taskInitiated = true;
                        vm.jobId = data.job_id;
                    });
            } else {
                vm.errorMsg = "Please enter a valid cluster name. Only alphanumeric and underscore characters are allowed."
            }

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

        function _setImportDetail() {
            vm.clusterObj = clusterStore.getClusterDetails(vm.clusterId);
            vm.hostList = vm.clusterObj.hosts;
            vm.taskId = vm.clusterObj.currentTaskId;
            vm.taskStatus = vm.clusterObj.currentStatus;
            vm.taskType = vm.clusterObj.jobType;
            if (vm.taskStatus === "failed" && vm.taskType === "ImportCluster") {
                vm.failedImport = true;
            }
        }

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "fqdn") {
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

    }

})();
