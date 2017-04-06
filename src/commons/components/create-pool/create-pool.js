(function () {
  'use strict';

  var app = angular.module('TendrlModule');
  app.controller("createPoolController", createPoolController);

  app.component('createPool', {
    // Loads the component template
    templateUrl: '/commons/components/create-pool/create-pool.html',
    controller: 'createPoolController',
    controllerAs: "createPoolCntrl"
    });

    function createPoolController($scope, $state, utils, $rootScope) {
    var vm = this;
        // edit variables
        vm.newField = {};
        vm.editing = false;
        vm.step = 1;
        vm.poolList = [];
        vm.cephClusterList = [];
        vm.updatePoolName = updatePoolName;
        vm.poolType = ["Standard","Erasure Coded"];
        vm.ECType = ["2+1"];
        vm.journalConfigration;
        vm.OSDs;
        vm.pgCount = 128;
        vm.minReplicas = 1;
        vm.owners = [];
        vm.checkboxModelOwnerValue = false;
        vm.checkboxModelQuotasValue = false;
        vm.checkboxModelQuotasMaxPercentageValue = false;
        vm.checkboxModelQuotasMaxObjectValue  = false;
        vm.checkboxModelQwnerValue = false; 
        vm.poolName = "MyPool";
        vm.poolCount = 3;
        vm.replicaCount = 3;
        vm.quotasMaxPercentage = 0;
        vm.quotasMaxObjects = 0;
        vm.taskSubmitted = false;

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

        vm.updateStep = function(step) {
            if (step === "inc") {
                vm.step += 1;
            } else if (step === "dec") {
                vm.step -= 1;
            } else {
                vm.step = step;
            }
            if(vm.step === 4) {
                poolList();
            }
            if(vm.step === 5) {
                createPool();
                
            }
        }

        function updatePoolName() {
            var i;

            vm.poolNames = [];

            for (i = 0; i < vm.poolCount; i++) {
                if (vm.poolCount === 1){
                    vm.poolNames.push(vm.poolName);
                }else{
                    vm.poolNames.push(vm.poolName + (i + 1));
                }
            }
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
            vm.selectedType = vm.poolType[0];
            vm.selectedEC = vm.ECType[0];
            vm.selectedOwner = vm.owners[0];
            vm.updatePoolName();
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

        function poolList() {

            var len = vm.poolNames.length,
            poolList = [],
            pool,
            i;

            for (i = 0; i < len; i++) {
                pool = {};
                pool.name = vm.poolNames[i];
                pool.type = vm.selectedType;
                pool.minSize = vm.minReplicas;
                pool.erasure_code_profile = vm.selectedEC;
                pool.cluster = vm.selectedCluster.cluster_id;
                pool.pgCount = vm.pgCount;
                pool.replicaCount = vm.replicaCount;
                pool.osdCount = vm.OSDs;
                pool.quotas = [vm.quotasMaxPercentage, vm.quotasMaxObjects];
                pool.conf = vm.journalConfigration;

                poolList.push(pool);
            }
            vm.poolList =  poolList;
        }

        function createPool(){

            var pool,
            i,
            len = vm.poolList.length;

            for(var i = 0; i < len; i++) {
                var postData = {};
                pool = vm.poolList[i];
                postData = {
                    "Pool.poolname": pool.name,
                    "Pool.pg_num": pool.pgCount,
                    "Pool.size": pool.replicaCount,
                    "Pool.min_size": pool.minSize,
                }
                if (vm.checkboxModelQuotasValue){
                    postData["Pool.quota_enabled"] = vm.checkboxModelQuotasValue;
                    postData["Pool.quota_max_objects"] = pool.quotas[1];
                    postData["Pool.quota_max_bytes"] = pool.quotas[0];
                    console.log(pool.quotas)
                }
                if(vm.poolList[i].type === "Erasure Coded"){
                    postData["Pool.type"] = "erasure";
                    if(vm.poolList[i].erasure_code_profile === "2+1"){
                        postData["Pool.erasure_code_profile"] = "default";
                    }
                    else{
                        postData["Pool.erasure_code_profile"] = vm.poolList[i].erasure_code_profile;
                    }
                }
                utils.takeAction(postData, "CephCreatePool", "POST", vm.selectedCluster.cluster_id).then(function(response) {
                    vm.taskSubmitted = true;
                    vm.jobId = response.job_id;
                    //$rootScope.notification.type = "success";
                    //$rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                });

            }
        }

        vm.editAppKey = function(field) {
            vm.editing = vm.poolList.indexOf(field);
            vm.newField = angular.copy(field);
            for(var i in vm.editMode){
                vm.editMode[i] = false;
            }
            vm.editMode[vm.editing] = true;
        }
        
        vm.cancelEdit = function(index) {
            if (vm.editing !== false) {
                vm.poolList[vm.editing] = vm.newField;
                vm.editing = false;
            }       
        };
        vm.saveEdit = function(index) {
            vm.editing = false;
        };

        vm.cancelCreate = function(){
            $state.go("pool");
        };

        vm.viewTaskProgress = function(){
            $state.go("task-detail", {taskId: vm.jobId});
        };
    }
})();