(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createClusterModalController", createClusterModalController);

    /*@ngInject*/
    function createClusterModalController($rootScope, $scope, $state) {

        var vm = this,
        clusterState;
        
        vm.valueSelected = "ceph";

        vm.cancelModal = function () {
            $rootScope.$emit('modal.done', 'cancel');
        };

        vm.closeModal = function () {
            $rootScope.$emit('modal.done', 'close');
        };

        vm.createCluster = function() {
            vm.closeModal();
            var clusterState = "create-"+vm.valueSelected+"-cluster";
            $state.go(clusterState);
        };

        vm.setSelected = function(valueSelected) {
           vm.valueSelected = valueSelected;
        };

        vm.modalHeader = {
            "title": "Select Storage Service",
            "close": vm.closeModal
        };

        vm.modalFooter = {
        	"cancelButton": {
                "name": "Cancel",
                "classname": "btn-default",
            },
            "nextStepButton":{
                "name": "Continue", 
                "classname": "btn-primary",
            },
            "cancelButtonCall": vm.cancelModal,
            "nextStepButtonCall": vm.createCluster
        };

        vm.StorageServices = [{
            "name": "Ceph",
            "value": "ceph"
        },{
            "name": "Gluster",
            "value": "gluster"  
        }];
    }

})();