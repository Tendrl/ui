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
    function importClusterController($state, $rootScope, clusterStore) {

        var vm = this,
            hostList;

        vm.filterBy = "fqdn";
        vm.orderBy = "fqdn";
        vm.enableProfiling = true;
        vm.taskInitiated = false;

        vm.importCluster = importCluster;
        vm.importCancel = importCancel;
        vm.viewTaskProgress = viewTaskProgress;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf importClusterController
         */
        function init() {
            if (!$rootScope.clusterTobeImported) {
                $state.go("clusters");
            } else {
                vm.hostList = vm.cluster.hosts;
            }
        }

        /**
         * @name importCluster
         * @desc Perform import cluster
         * @memberOf importClusterController
         */
        function importCluster() {
            clusterStore.importCluster($rootScope.clusterTobeImported, vm.enableProfiling)
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
            $state.go("task-detail", { taskId: vm.jobId });
        }

    }

})();
