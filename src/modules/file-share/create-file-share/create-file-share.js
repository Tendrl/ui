(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("CreateFileShareController", CreateFileShareController);

    /*@ngInject*/
    function CreateFileShareController($scope, $rootScope, $state, utils, $uibModal) {
        var vm = this;

        // vm.onCreateBrickModal = onCreateBrickModal;

        // function onCreateBrickModal(clusterData) {
        //     var wizardDoneListener,
        //         modalInstance,
        //         closeWizard;

        //     modalInstance = $uibModal.open({
        //         animation: true,
        //         backdrop: "static",
        //         templateUrl: "/modules/bricks/create-brick/create-brick.html",
        //         controller: "CreateBrickModalController",
        //         controllerAs: "vm",
        //         size: "lg",
        //         resolve : {
        //             clusterData: function() {
        //                 return clusterData;
        //             }
        //         }
        //     });

        //     closeWizard = function(e, reason) {
        //         modalInstance.dismiss(reason);
        //         wizardDoneListener();
        //     };

        //     modalInstance.result.then(function() {}, function() {});

        //     wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        // }    
    }

})();
