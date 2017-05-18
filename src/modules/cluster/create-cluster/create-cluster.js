(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createClusterController", createClusterController);

    /*@ngInject*/
    function createClusterController($rootScope, $scope, utils, $state, $uibModal) {

        var vm = this;
        vm.openWizardModel = openWizardModel;

        init();

        function init(){
            openWizardModel();
        }

        function openWizardModel() {
          var wizardDoneListener,
              modalInstance = $uibModal.open({
                animation: true,
                backdrop: 'static',
                templateUrl: '/modules/cluster/create-cluster/create-cluster-modal/create-cluster-modal.html',
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