(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($state) {
        var vm = this;

        vm.importCluster = importCluster;

        function importCluster() {
            $state.go("import-cluster");
        }
    }

})();
