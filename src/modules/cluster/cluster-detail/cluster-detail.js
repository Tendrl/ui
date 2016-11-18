(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils) {

        var vm = this;
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;

        vm.clusterId = $stateParams.clusterId;
        vm.tabList = {
            Volumes: 1
        };
        vm.activeTab = vm.tabList.Volumes;

        utils.getObjectList("Cluster").then(function(list) {
            vm.clusterList = list;
        });

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();
