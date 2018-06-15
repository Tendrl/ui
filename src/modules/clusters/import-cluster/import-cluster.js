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
    function importClusterController($state, $rootScope, $stateParams, $uibModal, clusterStore, taskStore, Notifications) {

        var vm = this;

        vm.clusterNamePattern = /^[a-zA-Z0-9][A-Za-z0-9_]*$/i;
        vm.filtersText = "";
        vm.clusterName = "";
        vm.enableProfiling = "enable";
        vm.taskInitiated = false;
        vm.importIcon = false;
        vm.failedImport = false;
        vm.isDataLoading = true;
        vm.hostList = [];
        vm.filteredHostList = [];
        vm.filters = [];
        vm.jobId = "";
        vm.importCluster = importCluster;
        vm.importCancel = importCancel;
        vm.viewTaskProgress = viewTaskProgress;

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

        /*BEGIN error modal*/
        vm.showErrorModal = false;
        vm.openImportErrorModal = openImportErrorModal;
        vm.closeErrorModal = closeErrorModal;
        vm.errorModalId = "errorModal";
        vm.errorModalTemplate = "/modules/clusters/import-cluster/import-fail/import-fail.html";
        vm.errorModalActionButtons = [{
            label: "Close",
            class: "btn-primary custom-class",
            isCancel: true
        }];

        function openImportErrorModal(taskId) {
            vm.errorModalTitle = "Details:" + taskId;
            vm.showErrorModal = true;
            vm.errorCluster = {};
            vm.errorCluster.initiateUnmanage = false;
            vm.errorCluster.enableProfiling = true;
            vm.errorCluster.taskInitiated = false;
            vm.errorCluster.isMessagesLoading = true;
            vm.errorCluster.logs = [];
            taskStore.getTaskLogs(taskId)
                .then(function(response) {
                    vm.errorCluster.logs = response;
                    vm.errorCluster.isMessagesLoading = false;
                }).catch(function(e) {
                    vm.errorCluster.isMessagesLoading = false;
                });
        }

        function closeErrorModal(dismissCause) {
            vm.showErrorModal = false;
        }

        /*END error modal*/


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
                _filterChange(vm.filters);
            }
        }

        /**
         * @name importCluster
         * @desc Perform import cluster
         * @memberOf importClusterController
         */
        function importCluster() {

            if (_validateFields()) {
                clusterStore.importCluster(vm.clusterId, vm.enableProfiling, vm.clusterName)
                    .then(function(data) {
                        vm.importIcon = true;
                        vm.taskInitiated = true;
                        vm.jobId = data.job_id;
                    }).catch(function(e) {
                        vm.importIcon = false;
                        vm.taskInitiated = false;
                        Notifications.message("danger", "", "Failed to initaite import.");
                    });
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

        /***Private Functions***/

        function _validateFields() {
            var isValid = true,
                clusterName = vm.clusterName && vm.clusterName.match(vm.clusterNamePattern);

            if (clusterName === null) {
                isValid = false;
                vm.errorMsg = "Please enter a valid cluster name. Only alphanumeric and underscore characters are allowed.";
            } else if (vm.filters.length) {
                isValid = false;
                vm.errorMsg = "Review the discovered host list, and ensure there are no filters applied before proceeding with Import.";
            }

            return isValid;
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