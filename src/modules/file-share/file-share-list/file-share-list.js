(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("fileShareController", fileShareController);

    /*@ngInject*/
    function fileShareController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this,
            timer,
            list,
            fileShareList,
            fileShare,
            fileShareObj,
            i,
            len,
            clusterObj;

        vm.deleteFileShareStep = 1;
        vm.selectedFileShare = null;
        vm.createFileShare = createFileShare;
        vm.onOpenFileShareDeleteModal = onOpenFileShareDeleteModal;
        vm.onDeleteFileShare = onDeleteFileShare;
        vm.viewTaskProgress = viewTaskProgress;

        init();

        function init() {
            list = utils.getFileShareDetails($scope.clusterId);
            vm.fileShareList = setupFileShareListData(list);
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

        function setupFileShareListData(list) {
            fileShareList = [];
            len = list.length;

            for (i = 0; i < len; i++) {
                fileShareObj = list[i];

                /* TODO: Need to remove when we have proper api response 
                and API should support for array data*/
                if (Object.keys(fileShareObj).length > 5) {
                    fileShare = {};
                    clusterObj = {};
                    fileShare.cluster_name = "Unassigned";
                    fileShare.id = fileShareObj.vol_id;
                    fileShare.status = fileShareObj.status;
                    fileShare.name = fileShareObj.name;
                    fileShare.type = fileShareObj.vol_type;
                    fileShare.cluster_id = fileShareObj.cluster_id;
                    if(fileShareObj.usable_capacity && fileShareObj.used_capacity){
                        fileShare.storage = {"total":fileShareObj.usable_capacity,"used":fileShareObj.used_capacity,"percent_used":fileShareObj.pcnt_used};
                    }
                    clusterObj = utils.getClusterDetails(fileShareObj.cluster_id);
                    if(typeof clusterObj !== "undefined") {
                         fileShare.cluster_name = clusterObj.integration_name || "NA";
                    }
                    fileShare.brick_count = fileShareObj.brick_count;
                    fileShare.alert_count = "NA"
                    fileShare.last_rebalance = "NA";
                    fileShare.bricks = fileShareObj.bricks;
                    fileShareList.push(fileShare);
                }
            }
            return fileShareList;
        }

        /*Refreshing list after each 30 second interval*/
        timer = $interval(function() {

            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    init();
                });

        }, 1000 * config.refreshIntervalTime);

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function createFileShare() {
            $state.go("add-inventory",{ clusterId: $scope.clusterId });
        }

        function onOpenFileShareDeleteModal(fileShare) {
            var key, brickObj;
            vm.deleteFileShareStep = 1;
            vm.errorInProcess = false;
            vm.brickList = [];
            vm.selectedFileShare = fileShare;
            vm.isDataRemain = 'true';
            vm.connectedClients = 10;
            if(vm.selectedFileShare.bricks) {
                for(key in vm.selectedFileShare.bricks) {
                    brickObj = {"name": "NA", "status": "NA", "usage": 20, "port": "NA", "pid": "NA"};
                    brickObj.name = vm.selectedFileShare.bricks[key].path;
                    brickObj.status = vm.selectedFileShare.bricks[key].status;
                    brickObj.port = vm.selectedFileShare.bricks[key].port;
                    vm.brickList.push(brickObj);
                }
            }
        }

        function onDeleteFileShare() {
            var postData;
            postData = { "Volume.volname": vm.selectedFileShare.name, "Volume.vol_id": vm.selectedFileShare.id};
            utils.takeAction(postData, "GlusterDeleteVolume", "DELETE", vm.selectedFileShare.cluster_id)
                .then(function(response) {
                    vm.deleteFileShareStep = 2;
                })
                .catch(function(error) {
                    vm.errorInProcess = true;
                    vm.deleteFileShareStep = 2;
                });
        }

        function viewTaskProgress(modalId) {
            $(modalId).modal("hide");
            
            setTimeout(function() {
                $state.go("task");
            },1000);
        }
    }

})();
