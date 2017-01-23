(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils, $scope) {

        var vm = this;
        vm.tabList = {"Host": 1};
        vm.tabName = "";
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;

        /* Adding clusterId in scope so that it will be accessible inside child directive */
        $scope.clusterId = $stateParams.clusterId;
        vm.clusterObj = utils.getClusterDetails($scope.clusterId);
        vm.clusterName = vm.clusterObj.maps ? vm.clusterObj.maps.config.cluster_name : "NA";
        if( vm.clusterObj.tendrl_context.sds_name === 'gluster' ) {
            vm.tabName = "FileShare";
        } else {
            vm.tabName = "Pool";
        }

        vm.tabList[vm.tabName] = 2;
        vm.activeTab = vm.tabList["Host"];

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();