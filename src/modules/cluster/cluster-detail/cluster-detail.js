(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils) {

        var vm = this;
        vm.tabList = {};
        vm.tabName = "";
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;

        vm.clusterId = $stateParams.clusterId;

        utils.getObjectList("Cluster").then(function(list) {
            vm.cluster = list.filter(function(cluster) {
                return cluster.cluster_id === vm.clusterId;
            })[0];

            /* Setting up the tab based on ceph/gluster */
            if(vm.cluster.sds_name === "gluster") {
                vm.tabName = "Volume";
            } else {
                vm.tabName = "Pool";
            }

            vm.tabList[vm.tabName] = 1;
            vm.activeTab = vm.tabList[vm.tabName];
            
        });

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();