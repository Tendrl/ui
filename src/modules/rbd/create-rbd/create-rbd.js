(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createRBDController", createRBDController);

    /*@ngInject*/
    function createRBDController($scope, $state, utils, $rootScope) {
        var vm = this,
            selectedPool,
            poolList,
            rbdList,
            index;

        vm.step = 1;
        vm.cephClusterList = [];
        vm.updateStep = updateStep;
        vm.updateRBDName = updateRBDName;
        vm.checkPoolList = checkPoolList;
        vm.isSizeGreater = isSizeGreater;
        vm.createRBDs = createRBDs;
        vm.editRBDsList = editRBDsList;
        vm.updateRBDsList = updateRBDsList;
        vm.viewTaskProgress = viewTaskProgress;
        vm.sizeUnits = ["GB", "TB"];

        //default values
        vm.poolTaskSubmitted = false;
        vm.backingPool = "existing";
        vm.rbdName = "MyBlockDevice";
        vm.rbdCount = 3;
        vm.targetSize = 128;
        vm.taskSubmitted = false;
        vm.isEditable = {};
        vm.editRbd = {};

        vm.isNextButtonDisabled = false;

        $scope.$watch(angular.bind(this, function (rbdName) {
          return vm.rbdName;
        }), function () {
            if(vm.rbdName.length === 0) {
                vm.isNextButtonDisabled = true;
            }else {
                vm.isNextButtonDisabled = false;
            }
        });

        if($rootScope.clusterData !== null && typeof $rootScope.clusterData !== "undefined") {
            init();
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            /* Forward to home view if we don't have any cluster */    
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("home");
            }else {
                init();
            }
        });

        function isSizeGreater() {
            if(vm.selectedCluster.utilization && vm.selectedCluster.utilization.available){
                var result = utils.convertToBytes(vm.targetSize * vm.rbdCount, vm.selectedUnit);
                return result > vm.selectedCluster.utilization.available;

            }
        }

        function updateStep(step) {
            var i, len = vm.rbdNames.length;

            if (step === "inc") {

                vm.step += 1;

                if(vm.step === 2) {
                    poolList = utils.getPoolDetails(vm.selectedCluster.cluster_id);
                    _createPoolList(poolList);
                    if(vm.poolList.length) {
                        vm.selectedPool = vm.poolList[0];
                    } else {
                        vm.isNextButtonDisabled = true;
                    }
                }

                if(vm.step === 3) {
                    vm.rbdList = [];
                    for(i = 0; i < len; i++ ) {
                        var rbd = {};
                        rbd.pool_id = vm.selectedPool.pool_id;
                        rbd.name = vm.rbdNames[i];
                        rbd.size = vm.targetSize;
                        rbd.unit = vm.selectedUnit;

                        vm.rbdList.push(rbd)
                    }
                }
                
                if(vm.step === 4) {
                    vm.createRBDs();
                }
            
            } else if (step === "dec") {
                vm.step -= 1;

                if(vm.step === 1) {
                    vm.backingPool =  "existing"
                    if(vm.rbdName.length) {
                        vm.isNextButtonDisabled = false;
                    }
                }
            }
        }

        function updateRBDName() {
            var i;

            vm.rbdNames = [];

            for (i = 0; i < vm.rbdCount; i++) {
                vm.rbdNames.push(vm.rbdName + (i + 1));
            }
        }

        function checkPoolList(){
            return (vm.step === 2 && vm.poolList.length === 0)
        }

        function init() {

            if (typeof $rootScope.clusterData !== "undefined") {
                getCephClusterList();
            } else {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        getCephClusterList();
                    });
            }

            vm.selectedCluster = vm.cephClusterList[0];
            vm.selectedUnit = vm.sizeUnits[0];
            vm.updateRBDName();
            
        }

        function getCephClusterList(){
            var index;
            var clustersLength = $rootScope.clusterData.clusters.length;
            for(index = 0 ; index < clustersLength ; index++) {
                if($rootScope.clusterData.clusters[index].sds_name === 'ceph') {
                    vm.cephClusterList.push($rootScope.clusterData.clusters[index]);
                }
            }
        }

        function _createPoolList(list) {

            var len = list.length,
                poolList = [],
                pool,
                i;

            for (i = 0; i < len; i++) {
                if(list[i].type === 'replicated' ) {
                    pool = {};
                    pool.pool_id = list[i].pool_id;
                    pool.name = list[i].pool_name;
                    pool.type = list[i].type;
                    pool.clusterId = list[i].cluster_id;
                    pool.pgCount = list[i].pg_num;
                    pool.replicaCount = list[i].size;
                    pool.osdCount = list[i].osd_count;
                    pool.quotas = "NA";
                    pool.quota_enabled = list[i].quota_enabled;
                    if(list[i].quota_enabled){
                        if(list[i].quota_enabled.toLowerCase() === "false") {
                            pool.quotas = "Disabled";
                            pool.quota_max_objects = list[i].quota_max_objects;
                            pool.quota_max_bytes = list[i].quota_max_bytes;

                        } else if(list[i].quota_enabled.toLowerCase() === "true") {
                            pool.quota_max_objects = list[i].quota_max_objects;
                            pool.quota_max_bytes = list[i].quota_max_bytes;
                            if(pool.quota_max_bytes !== "0" && pool.quota_max_objects !=="0"){
                                pool.quotas = pool.quota_max_bytes + "%, " + pool.quota_max_objects + " objects"
                            }
                            else if(pool.quota_max_bytes !== "0"){
                                pool.quotas = pool.quota_max_bytes + "%";
                            }
                            else if(pool.quota_max_objects !== "0"){
                                pool.quotas = pool.quota_max_objects + " objects";
                            }
                        }
                    }
                    pool.conf = list[i].conf;
                    poolList.push(pool);
                }
            }

            vm.poolList = poolList;
        }

        function createRBDs() {
            var i, len = vm.rbdList.length, sizeInBytes, sizeInMB, postData;
            for(i = 0; i < len; i++) {

                sizeInBytes = utils.convertToBytes(vm.rbdList[i].size, vm.rbdList[i].unit);
                sizeInMB = (sizeInBytes / (1024*1024)).toFixed(0);
                vm.rbdList[i].size = parseInt(sizeInMB);
                postData = { "Rbd.pool_id": parseInt(vm.rbdList[i].pool_id), "Rbd.name": vm.rbdList[i].name, "Rbd.size": vm.rbdList[i].size };
                
                utils.takeAction(postData, "CephCreateRbd", "POST", vm.selectedCluster.cluster_id).then(function(response) {
                    vm.jobId = response.job_id;
                    vm.taskSubmitted = true;
                    //$rootScope.notification.type = "success";
                    //$rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                });

            }
            
        }

        function editRBDsList(index, rbd) {
            var i, len = vm.rbdNames.length;
            for(i = 0; i < len; i++ ) {
                vm.isEditable[i] = false;
            }
            vm.isEditable[index] = true;
            vm.editRbd.name =  rbd.name;
            vm.editRbd.size =  rbd.size;
            vm.editRbd.unit =  rbd.unit;
        }

        function updateRBDsList(index, rbd) {
            rbd.name = vm.editRbd.name;
            rbd.size = vm.editRbd.size;
            rbd.unit = vm.editRbd.unit;
            vm.isEditable[index] = false;
        }  

        function viewTaskProgress(){
            $state.go("task-detail", {taskId: vm.jobId});
        };
    }

})();