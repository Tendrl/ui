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
            _redirectto();
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
            "close": vm.cancelModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        },{
            "name": "Next",
            "classname": "btn-primary",
            "onCall": vm.createCluster
        }];

        vm.StorageServices = [{
            "name": "Ceph",
            "value": "ceph"
        },{
            "name": "Gluster",
            "value": "gluster"
        }];

        function _redirectto(){
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("landing-page");
            } else {
                $state.go("cluster");
            }
        }
    }

})();