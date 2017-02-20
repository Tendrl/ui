(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils, $scope) {

        var vm = this;
        vm.tabList = {"Host": 1};
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;

        /* Adding clusterId in scope so that it will be accessible inside child directive */
        $scope.clusterId = $stateParams.clusterId;
        vm.clusterObj = utils.getClusterDetails($scope.clusterId);
        vm.clusterName = vm.clusterObj.name || "NA";
         if( vm.clusterObj.sds_name === "glusterfs" ) {
            vm.tabList.FileShare = 2;
        } else {
            vm.tabList.Pool = 2;
            vm.tabList.RBD = 3;
        }

        vm.activeTab = vm.tabList["Host"];

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();