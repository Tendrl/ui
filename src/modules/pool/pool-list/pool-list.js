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
        vm.growPGs = growPGs;
        vm.isDataLoading = true;
        vm.errorInProcess = false;
        vm.showClusterNAMsg = false;
        vm.viewTaskProgress = viewTaskProgress;

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
                pool.replicaCount = list[i].size ? list[i].size : "NA";
                pool.osdCount = "NA";
                pool.quotas = "NA";
                if(list[i].quota_enabled){
                    if(list[i].quota_enabled.toLowerCase() === "false") {
                        pool.quotas = "Disabled";
                    } else if(list[i].quota_enabled.toLowerCase() === "true") {
                        pool.quotas = list[i].quota_max_objects;
                    }
                }
                pool.alertCount = "NA";
                
                poolList.push(pool);
                
            }
            vm.poolList = poolList;
        }

        function createPool() {
            $state.go("create-pool");
        }

        function onOpenGrowPGModal(pool) {

            vm.growPGStep = 1;
            vm.growPGtaskSubmitted = false;
            vm.growPGPool = pool;
            vm.updatedPool = {};
            vm.updatedPool.pgCount = vm.growPGPool.pgCount = parseInt(vm.growPGPool.pgCount);
            vm.updatedPool.incPGCnt = "immediate";

            console.log(pool, "pool");
        }

        function growPGs() {
            var postData;

            postData = { "Pool.pool_id": parseInt(vm.growPGPool.id), "Pool.poolname": vm.growPGPool.name, "Pool.pg_num": vm.updatedPool.pgCount, "Pool.min_size": parseInt(vm.growPGPool.minSize) };
            
            utils.takeAction(postData, "CephUpdatePool", "PUT", vm.growPGPool.clusterId)
                .then(function(response) {
                    $rootScope.notification.type = "success";
                    $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                    vm.growPGStep = 2;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.growPGStep = 2;
                });
            
        }

        function viewTaskProgress() {

            $("#growPGModal").modal("hide");
            
            setTimeout(function() {
                $state.go("task");
            },1000);
        }
    }

})();