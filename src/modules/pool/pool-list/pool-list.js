(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("poolController", poolController);

    /*@ngInject*/
    function poolController($scope, $rootScope, $state, $interval, config, utils) {
        var vm = this,
            key,
            len,
            poolList = [],
            pool,
            list,
            i,
            timer,
            clusterObj;

        vm.createPool = createPool;
        vm.onOpenGrowPGModal = onOpenGrowPGModal;
        vm.onOpenPoolEditModal = onOpenPoolEditModal;
        vm.growPGs = growPGs;
        vm.EditPool =EditPool;
        vm.viewTaskProgress = viewTaskProgress;

        vm.isDataLoading = true;
        vm.errorInProcess = false;
        vm.showClusterNAMsg = false;
        vm.errorInProcess = false;

        init();

        function init() {
            list = utils.getPoolDetails($scope.clusterId);
            _createPoolList(list);
            vm.isDataLoading = false;
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

        /*Refreshing list after each 30 second interval*/
        timer = $interval(function () {

            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    init();
                });

        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(timer);
        });


        function _createPoolList(list) {

            len = list.length;
            poolList = [];

            for ( i = 0; i < len; i++) {
                pool = {};
                clusterObj = {};
                pool.clusterName = "Unassigned";
                pool.name = list[i].pool_name;
                pool.clusterId = list[i].cluster_id;
                pool.pgCount = list[i].pg_num;
                pool.id = list[i].pool_id;
                pool.minSize = list[i].min_size;
                clusterObj = utils.getClusterDetails(list[i].cluster_id);
                if(typeof clusterObj !== "undefined") {
                    pool.clusterName = clusterObj.name;
                }
                pool.status = "NA";
                pool.type = list[i].type;
                pool.utilization = {"percent_used": list[i].percent_used };
                pool.replicaCount = list[i].size;
                pool.minReplicaCount = list[i].min_size;
                pool.osdCount = "NA";
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
                pool.alertCount = "NA";
                
                poolList.push(pool);
                
            }
            vm.poolList = poolList;
        }


        function onOpenPoolEditModal(pool)
        { 
            vm.editPoolStep = 1;
            vm.editPoolObj = pool;
            vm.editPoolObj.poolName = pool.name
            vm.editPoolObj.checkboxModelQuotasValue = (vm.editPoolObj.quota_enabled === "True") ? true : false;
            vm.editPoolObj.checkboxModelQuotasMaxObjectValue = false;
            vm.editPoolObj.checkboxModelQuotasMaxPercentageValue = false;
            vm.editPoolObj.checkboxModelReplicas = false;
            vm.editPoolObj.editReplicaCount = parseInt(pool.replicaCount);
            vm.editPoolObj.editMinReplicaCount = parseInt(pool.minReplicaCount);
            vm.editPoolObj.quota_max_objects = parseInt(vm.editPoolObj.quota_max_objects);
            vm.editPoolObj.quota_max_bytes = parseInt(vm.editPoolObj.quota_max_bytes);
            vm.editPoolObj.checkboxModelNoChange = false;
            vm.editPoolObj.checkboxModelNoDelete = false;
            vm.editPoolObj.checkboxModelNoScrub = false;
            vm.editPoolObj.checkboxModelNoDeepScrub = false;
        }

        function EditPool(){
            var postData;

            postData = { "Pool.pool_id": parseInt(vm.editPoolObj.id), "Pool.poolname": vm.editPoolObj.poolName, "Pool.min_size": parseInt(vm.editPoolObj.editMinReplicaCount) };
            
            utils.takeAction(postData, "CephUpdatePool", "PUT", vm.editPoolObj.clusterId)
                .then(function(response) {
                    // $rootScope.notification.type = "success";
                    // $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                    vm.editPoolStep = 4;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.editPoolStep = 4;
                });
            
            }

        function onOpenGrowPGModal(pool) {
            vm.growPGStep = 1;
            vm.growPGtaskSubmitted = false;
            vm.growPGPool = pool;
            vm.updatedPool = {};
            vm.updatedPool.pgCount = vm.growPGPool.pgCount = parseInt(vm.growPGPool.pgCount);
            vm.updatedPool.incPGCnt = "immediate";

        }

        function growPGs() {
            var postData;

            postData = { "Pool.pool_id": parseInt(vm.growPGPool.id), "Pool.pg_num": vm.updatedPool.pgCount};
            
            utils.takeAction(postData, "CephUpdatePool", "PUT", vm.growPGPool.clusterId)
                .then(function(response) {
                    // $rootScope.notification.type = "success";
                    // $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                    vm.growPGStep = 2;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.growPGStep = 2;
                });
            
        }

        function viewTaskProgress(modalId) {
            $(modalId).modal("hide");
            
            setTimeout(function() {
                $state.go("task");
            },1000);
        }

        function createPool() {
            $state.go("create-pool");
        }
    }

})();
