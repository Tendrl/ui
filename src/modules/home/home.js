(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("homeController", homeController);

    /*@ngInject*/
    function homeController($rootScope, $scope, $state) {

        var vm = this;
        vm.importCluster = importCluster;

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            if($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0){
                /* Forward to cluster view if we have don't have at least one cluster */
                $state.go("cluster");
            }
        });

        function importCluster() {
            $state.go('import-cluster');
        }
        
    }

})();