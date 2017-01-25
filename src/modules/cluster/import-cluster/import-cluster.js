(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("importClusterController", importClusterController);

    /*@ngInject*/
    function importClusterController($rootScope, $state, $stateParams, utils) {
        var vm = this, hostList = [], hostDetail = {};
        
        vm.step = 1;
        vm.detectedClusters = [];
        vm.init = init;
        vm.importCluster = importCluster;
        vm.importCancel = importCancel;
        vm.viewTaskProgress = viewTaskProgress;
        vm.selectCluster = selectCluster;
        vm.init();

        function init() {
            vm.isDataLoading = true;
            utils.getObjectList("Node").then(function(list) {
                vm.isDataLoading = false;
                vm.detectedClusters = [];
                if(list !== null) {
                    hostList = list.nodes;
                    vm.detectedClusters = list.clusters;
                    vm.selectedCluster = vm.detectedClusters[0];
                    vm.selectedClusterVersion = vm.selectedCluster.sds_version
                    hostDetail = setHostDetails(vm.selectedCluster.node_ids);
                    vm.selectedCluster.hosts = hostDetail.hosts;
                    vm.selectedCluster.sds_type = hostDetail.sds_type;
                }
            });
        }

        function setHostDetails(hostIds) {
            var role = {
                "mon": "Monitor",
                "osd": "OSD Host",
                "server": "Peer",
                "rados": "RADOS Gateway"
            }
            var i, hostIdslength = hostIds.length, id, j, hostListlength = hostList.length, host = {}, associatedHosts, sds_type, tags;
            associatedHosts = [];
            for (i = 0; i < hostIdslength; i++) {
                id = hostIds[i];
                for(j = 0; j < hostListlength; j++) {
                    if(hostList[j].node_id === id) {
                        if(i===0) {
                            sds_type = vm.selectedCluster.sds_name + " " +vm.selectedCluster.sds_version
                        }
                        host = {};
                        if(hostList.tags !== "undefined"){
                            tags = hostList[j].tags.split("/")
                            host.release = tags[0]+ " " +vm.selectedClusterVersion
                            host.role = role[tags[1]]
                        }
                        host.name = hostList[j].fqdn;
                        associatedHosts.push(host);
                        break;
                    }
                }
            }
            return { hosts: associatedHosts , sds_type: sds_type };
            
        }

        function selectCluster() {
            hostDetail = setHostDetails(vm.selectedCluster.node_ids);
            vm.selectedCluster.hosts = hostDetail.hosts;
            vm.selectedCluster.sds_type = hostDetail.sds_type;
        }

        function importCluster() {
            var uri;
            if(vm.selectedCluster.sds_type.includes("ceph")) {
                uri = "ImportCephCluster";
            } else {
                uri = "ImportGlusterCluster";
            }
            utils.importCluster(uri, vm.selectedCluster).then(function(list) {
                vm.step = 2;
            });
        }

        function viewTaskProgress() {
            $state.go("task");
        }

        function importCancel() {
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("home");
            }else {
                $state.go("cluster");
            }
        }


    }

})();