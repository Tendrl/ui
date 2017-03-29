(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("homeController", homeController);

    /*@ngInject*/
    function homeController($rootScope, $scope, $state, $uibModal) {

        var vm = this;
        vm.importCluster = importCluster;   

        init();
        
        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            init();
        });

        function init() {
            if($rootScope.clusterData !== null && $rootScope.clusterData.clusters.length !== 0){
                /* Forward to cluster view if we have don't have at least one cluster */
                $state.go("cluster");
            }
        }

        function importCluster() {
            $state.go('import-cluster');
        }

        vm.openWizardModel = function () {
          var wizardDoneListener,
              modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: '/modules/home/create-cluster-modal/create-cluster-modal.html',
                controller: 'createClusterModalController',
                size: 'md'
              });

          var closeWizard = function (e, reason) {
            modalInstance.dismiss(reason);
            wizardDoneListener();
          };

          modalInstance.result.then(function () { }, function () { });

          wizardDoneListener = $rootScope.$on('modal.done', closeWizard);
        };
        
    }

})();