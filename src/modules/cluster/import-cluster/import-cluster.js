(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("importClusterController", importClusterController);

    /*@ngInject*/
    function importClusterController($rootScope, $state, $stateParams, utils, config) {
        var vm = this;

        vm.storageService = $stateParams.storageService;
        vm.importFlows = {};

        vm.colums = [{name:"Host Name"}];
        vm.freeNodes = [];
        vm.selectedNodes = [];
        vm.importCluster = importCluster;
        vm.cancel = cancel;

        utils.getObjectWorkflows().then(function(flows) {
            var len = flows.length, i;
            for (i = 0; i < len ; i++) {
                if(flows[i].name === vm.storageService) {
                    vm.importFlows = flows[i];
                }
            };
        });

        utils.getObjectList("Node").then(function(freeNodes) {
              vm.freeNodes = freeNodes;
        });

        function importCluster(){
            if(vm.selectedNodes.length === 0) {
                $rootScope.notification.type = "danger";
                $rootScope.notification.message = "Please select at least one node.";
            } else {
                var requestData = {}, len = vm.importFlows.attributes.length, i;
                for (i = 0; i < len ; i++) {
                    if(vm.importFlows.attributes[i].name.indexOf("name") !== -1) {
                        if (vm.importFlows.name.indexOf("Gluster") !== -1) {
                            requestData[vm.importFlows.attributes[i].name] = "gluster";
                        } else if (vm.importFlows.name.indexOf("Ceph") !== -1) {
                            requestData[vm.importFlows.attributes[i].name] = "ceph";
                        }
                    } else if(vm.importFlows.attributes[i].name.indexOf("version") !== -1) {
                        requestData[vm.importFlows.attributes[i].name] = "3.2.1";
                    } else if(vm.importFlows.attributes[i].name.indexOf("[]") !== -1) {
                        requestData[vm.importFlows.attributes[i].name] = vm.selectedNodes;
                    }
                };
                utils.takeAction(requestData, vm.importFlows.name, vm.importFlows.method).then(function(responseObject) {
                    $rootScope.notification.type = "success";
                    $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + responseObject.job_id;
                    $state.go('cluster');
                });
            }
            
        }

        function cancel() {
            $state.go('cluster');
        }


    }

})();