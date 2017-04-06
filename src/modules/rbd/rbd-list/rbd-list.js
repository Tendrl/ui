(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("rbdController", rbdController);

    /*@ngInject*/
    function rbdController($scope, $rootScope, $state, $interval, config, utils, $filter) {
        var vm = this,
            key,
            len,
            rbdList = [],
            rbd,
            list,
            i,
            timer,
            clusterObj;

        vm.createRbd = createRbd;
        vm.onOpenRbdResizeModal = onOpenRbdResizeModal;
        vm.resizeRBD = resizeRBD;
        vm.viewTaskProgress = viewTaskProgress;
        vm.resizeRBD = resizeRBD;
        vm.resizeRbd = {"unit": "MB" , "size": 0};
        vm.sizeUnits = ["MB", "GB", "TB"];
        vm.resizeRBDtaskSubmitted = false;
        vm.resizeRBDstep = 1;

        init();

        function init() {
            list = utils.getRBDsDetails($scope.clusterId);
            _createRbdList(list);
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


        function _createRbdList(list) {
            var utilization_percent,
                clusterObj;
            len = list.length;
            rbdList = [];

            for ( i = 0; i < len; i++) {
                rbd = {};
                clusterObj = {};
                
                rbd.name = list[i].name;
                rbd.clusterId = list[i].clusterId;
                rbd.pool_id = list[i].pool_id;
                rbd.size = parseInt(list[i].size);
                rbd.clusterName = "NA";
                clusterObj = utils.getClusterDetails(list[i].clusterId);
                if(typeof clusterObj !== "undefined") {
                    rbd.clusterName = clusterObj.cluster_name;
                }
                if( typeof list[i].used !== "undefined" && typeof list[i].provisioned !== "undefined") {
                    utilization_percent = ( (parseInt(list[i].used) * 100) / parseInt(list[i].provisioned) );
                    rbd.utilization = {"percent_used": utilization_percent };
                }
                rbd.backingPool = list[i].backingPool;
                rbd.isBackingPoolShared = list[i].isBackingPoolShared;
                rbd.alertCount = "NA";
                
                rbdList.push(rbd);
                
            }
            vm.rbdList = rbdList;
        }

        function createRbd() {
            $state.go("create-rbd");
        }

        function onOpenRbdResizeModal(rbdObject) {
            var clusterObj;
            
            vm.resizeRBDstep = 1;
            vm.resizeRBDtaskSubmitted = false;
            vm.resizeRbd = rbdObject;
            
            if(rbdObject.size) {
                /* Now RBD's size always come in "MB" unit 
                and also we need to send data in "MB" while reside RBD. */
                vm.resizeRbd.size = parseInt(rbdObject.size);
                vm.resizeRbd.unit = "MB"
            }
            
            clusterObj = utils.getClusterDetails(rbdObject.clusterId);
            vm.resizeRbd.clusterAvailable = "NA";
            
            if( typeof clusterObj.utilization !== "undefined" ) {
                vm.resizeRbd.clusterAvailable = clusterObj.utilization.available;
            }
        }


        function resizeRBD() {
            var sizeInBytes, sizeInMB, postData;
            sizeInBytes = utils.convertToBytes(vm.resizeRbd.size, vm.resizeRbd.unit);
            sizeInMB = (sizeInBytes / (1024*1024));
            vm.resizeRbd.size = parseFloat(sizeInMB);

            postData = { "Rbd.pool_id": parseInt(vm.resizeRbd.pool_id), "Rbd.name": vm.resizeRbd.name, "Rbd.size": vm.resizeRbd.size };
            
            utils.takeAction(postData, "CephResizeRbd", "PUT", vm.resizeRbd.clusterId)
                .then(function(response) {
                    // $rootScope.notification.type = "success";
                    // $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                    vm.resizeRBDstep = 2;
                    vm.jobId = response.job_id;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.resizeRBDstep = 2;
                });
        }

        function viewTaskProgress() {
            vm.resizeRBDtaskSubmitted = true;
            $("#rbdResizeModal").modal("hide");
            setTimeout(function() {
                $state.go("task-detail", {taskId: vm.jobId});
            },1000)
        }
    }

})();