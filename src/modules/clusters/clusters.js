(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $controller, $rootScope, clusterStore, dataStorage, tabManager) {

        var vm = this,
            hostVm;

        vm.getClusterList = getClusterList;
        vm.showClusterList = showClusterList;
        vm.hideClusterList = hideClusterList;
        vm.setTab = setTab;
        vm.showList = false;
        $rootScope.showNavContent = false;
        vm.activeTab = 1;

        init();

        function getClusterList() {
            clusterStore.getClusterList().then(function(data) {
                data = data.data;
                console.log("data", data);
                
                vm.clusterList = data;
                vm.selectedCluster = vm.clusterList[0];
                $rootScope.showNavContent = true;

                //setting selected cluster's details into the service
                clusterStore.getClusterDetails(vm.selectedCluster).then(function(data) {
                    dataStorage.setClusterInfo(data);

                    //TODO: modify overall_status property in cluster store
                    vm.selectedCluster.status = data.status;

                });
            });
        };

        function showClusterList() {
            vm.showList = !vm.showList;
        }

        function init() {
            getClusterList();
            vm.setTab(1);
        }

        function hideClusterList() {
            vm.showList = false;
        }

        function setTab(tabNo) {
            tabManager.setActiveTab(tabNo);
            vm.activeTab = tabNo;
        }
    }

})();
