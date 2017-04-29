(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils, $scope, $rootScope) {

        var vm = this;
        vm.tabList = { "Host": 1 };
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;

        /* Adding clusterId in scope so that it will be accessible inside child directive */
        $scope.clusterId = $stateParams.clusterId;

        if (!$rootScope.clusterData) {
            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    _setClusterDetail();
            });
            
        } else {
            _setClusterDetail();            
        }

        function _setClusterDetail() {
            vm.clusterObj = utils.getClusterDetails($scope.clusterId);
            vm.clusterName = vm.clusterObj.cluster_name || "NA";
            if (vm.clusterObj.sds_name === "gluster") {
                vm.tabList.FileShare = 2;
            } else {
                vm.tabList.Pool = 2;
                vm.tabList.RBD = 3;
            }
            vm.activeTab = vm.tabList["Host"];
        }


        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();
