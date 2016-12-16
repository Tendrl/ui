(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, utils, config, $uibModal) {
        var vm = this;

        vm.importFlows = [];
        vm.selectedStorageService = "";
        vm.openImportClusterModal = openImportClusterModal;
        vm.importCluster = importCluster;
        vm.init = init;
        vm.init();

        function init() {
            utils.getObjectList("Cluster").then(function(list) {
                vm.clusterList = [];
                if(list !== null) {
                    vm.clusterList = list;
                }
            });

            utils.getObjectWorkflows().then(function(importFlows) {
                vm.importFlows = importFlows;
                /* Todo: remove when we have proper name from api response */
                var len = vm.importFlows.length,
                            i,key;
                for (i = 0; i < len ; i++) {
                    if(vm.importFlows[i].name.indexOf('Ceph') !== -1) {
                        vm.importFlows[i].title = "Red Hat Ceph Storage";
                    } else if(vm.importFlows[i].name.indexOf('Gluster') !== -1) {
                        vm.importFlows[i].title = "Red Hat Gluster Storage";
                    } 
                }

            });
        }

        /*Refreshing list after each 30 second interval*/
        var timer = $interval(function () {
          vm.init();
        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function openImportClusterModal() {
            if(vm.importFlows.length ===1) {
                $state.go('import-cluster', {storageService: vm.importFlows[0].name});
            } else {
                var modalInstance = $uibModal.open({
                    templateUrl: '../modules/cluster/import-cluster-modal.tpl.html',
                    scope: $scope,
                    size: 'md'
                });
            }
        }

        function importCluster(storageService) {
            $state.go('import-cluster', {storageService: storageService});
        }
    }

})();