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

        vm.filterBy = "fqdn";
        vm.filterByValue = "Name";
        vm.filterPlaceholder = "Name";
        vm.enableProfiling = true;
        vm.taskInitiated = false;
        vm.importIcon = false;
        vm.importCluster = importCluster;
        vm.importCancel = importCancel;
        vm.viewTaskProgress = viewTaskProgress;
        vm.changingFilterBy = changingFilterBy;

        vm.sortConfig = {
            fields: [{
                    id: 'fqdn',
                    title: 'Name',
                    sortType: 'alpha'
                },
                {
                    id: 'role',
                    title: 'Role',
                    sortType: 'alpha'
                }
            ],
            onSortChange: _sortChange
        };

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf importClusterController
         */
        function init() {
            vm.clusterId = $rootScope.clusterTobeImported.clusterId;
            vm.taskId = $stateParams.taskId;
            vm.taskStatus = $stateParams.taskStatus;
            if (!$rootScope.clusterTobeImported) {
                $state.go("clusters");
            } else {
                vm.hostList = vm.cluster.hosts;
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
        };

        function failedImport(clusterId, taskId) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/clusters/import-cluster/import-fail/import-fail.html",
                controller: "importFailController",
                controllerAs: "vm",
                size: "md",
                resolve: {
                    failedJob: function() {
                        return {
                            clusterId: clusterId,
                            jobId: taskId
                        };
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
            vm.importIcon = true;
            if (vm.taskStatus === "failed") {
                failedImport(vm.clusterId, vm.taskId);
            } else {
                clusterStore.importCluster($rootScope.clusterTobeImported, vm.enableProfiling)
                    .then(function(data) {
                        vm.taskInitiated = true;
                        vm.jobId = data.job_id;
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
                $rootScope.selectedClusterOption = "";
                $state.go("task-detail", { clusterId: vm.clusterId, taskId: vm.jobId });
            }
        }

        function changingFilterBy(filterValue) {
            vm.filterBy = filterValue;
            switch (filterValue) {
                case "fqdn":
                    vm.filterByValue = "Name";
                    vm.filterPlaceholder = "Name";
                    break;

                case "role":
                    vm.filterByValue = "Role";
                    vm.filterPlaceholder = "Role";
                    break;

            };
        }

    }

})();