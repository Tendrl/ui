(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($state, utils) {
        var vm = this;

        vm.importCluster = importCluster;

        utils.getObjectList("Cluster").then(function(list) {
            vm.clusterList = list;
        });

        function importCluster() {
            $state.go("import-cluster");
        }
    }

})();
