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
        vm.rbdResizeModal = rbdResizeModal;
        vm.resizeRBD = resizeRBD;
        vm.resizeRbd = {"unit": "" , "size": 0};
        vm.sizeUnits = ["MB", "GB", "TB"];
        vm.resizeRBDtaskSubmitted = false;
        vm.viewTaskProgress = viewTaskProgress;

        init();

        function init() {
            console.log("controller");
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
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });


        function _createRbdList(list) {
            var utilization_percent;
            len = list.length;
            rbdList = [];

            for ( i = 0; i < len; i++) {
                rbd = {};
                clusterObj = {};
                
                rbd.name = list[i].name;
                rbd.clusterId = list[i].clusterId;
                rbd.clusterName = list[i].clusterName;
                if( typeof list[i].used !== "undefined" && typeof list[i].provisioned !== "undefined") {
                    utilization_percent = ( (parseInt(list[i].used) * 100) / parseInt(list[i].provisioned) );
                    rbd.utilization = {"percent_used": utilization_percent };
                    rbd.used = list[i].used;
                    rbd.provisioned = list[i].provisioned;
                }
                rbd.backingPool = list[i].backingPool;
                rbd.pool_id = list[i].pool_id;
                rbd.isBackingPoolShared = list[i].isBackingPoolShared;
                rbd.alertCount = "NA";
                
                rbdList.push(rbd);
                
            }
            vm.rbdList = rbdList;
        }

        function createRbd() {
            $state.go("create-rbd");
        }

        function rbdResizeModal(rbdObject) {
            vm.resizeRBDtaskSubmitted = false;
            var used, sizeAndUnit = [], clusterObj;
            vm.resizeRbd = rbdObject;
            if(rbdObject.used) {
                used = $filter('bytes')(rbdObject.used);
                sizeAndUnit = used.split(' ');
                vm.resizeRbd.size = Math.round(parseFloat(sizeAndUnit[0]));
                vm.resizeRbd.unit = sizeAndUnit[1];
            }
            clusterObj = utils.getClusterDetails(rbdObject.clusterId);
            console.log("this is the cluster obj " , clusterObj);
            vm.resizeRbd.clusterAvailable = clusterObj.utilization.available;
        }


        function resizeRBD() {
            var sizeInBytes, sizeInMB, postData;
            console.log("this is the unit " , vm.resizeRbd.unit );
            sizeInBytes = utils.convertToBytes(vm.resizeRbd.size, vm.resizeRbd.unit);
            sizeInMB = (sizeInBytes / (1024*1024)).toFixed(0);
            vm.resizeRbd.size = parseInt(sizeInMB);

            postData = { "Rbd.pool_id":vm.resizeRbd.pool_id, "Rbd.name": vm.resizeRbd.name, "Rbd.size": vm.resizeRbd.size };
            
            utils.takeAction(postData, "CephResizeRbd", "PUT", vm.resizeRbd.clusterId).then(function(response) {
                $rootScope.notification.type = "success";
                $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
            });

            vm.resizeRBDtaskSubmitted = true;
        }


        function viewTaskProgress() {
            angular.element('#rbdResizeModal').modal('hide');
            setTimeout(function(){
                $state.go("task");
            }, 1000);
        }
    }

})();
