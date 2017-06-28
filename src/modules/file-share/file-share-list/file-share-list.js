(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("fileShareController", fileShareController);

    /*@ngInject*/
    function fileShareController($scope, $rootScope, $state, $interval, $uibModal, $filter, utils, volumeStore, config) {
        var vm = this,
            volumeTimer,
            list,
            fileShareList,
            fileShare,
            fileShareObj,
            i,
            len,
            clusterObj;

        vm.deleteFileShareStep = 1;
        vm.selectedFileShare = null;
        vm.isDataLoading = true;
        vm.createFileShare = createFileShare;
        vm.onOpenFileShareDeleteModal = onOpenFileShareDeleteModal;
        vm.onDeleteFileShare = onDeleteFileShare;
        vm.viewTaskProgress = viewTaskProgress;
        vm.stopVolume = stopVolume;
        vm.startVolume = startVolume;
        vm.rebalanceVolume = rebalanceVolume;
        vm.isRebalanceAllowed = isRebalanceAllowed;
        vm.getRebalStatus = getRebalStatus;

        init();

        function init() {
            utils.getObjectList("Cluster")
                .then(function(data) {
                    $interval.cancel(volumeTimer);
                    $rootScope.clusterData = data;
                    list = utils.getFileShareDetails($scope.clusterId);
                    vm.fileShareList = setupFileShareListData(list);
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function startTimer() {
            volumeTimer = $interval(function() {
                init();
            }, 1000 * config.refreshIntervalTime, 1);
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

        function getRebalStatus(volume) {
            switch(volume.rebalStatus) {
                case "completed": return "Completed";
                                    break
                case "not_started": return "Not Started";
                                    break
                case "not started": return "Not Started";
                                    break;
                case "in progress": return "In Progress";
                                    break;
                case "in_progress": return "In Progress";
                                    break;
                case "failed": return "Failed";
                                break;
                case "stopped": return "Stopped";
                                break;
                default: return "NA";
            }
        }

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
                    fileShare.rebalStatus = fileShareObj.rebal_status;
                    if(fileShareObj.usable_capacity && fileShareObj.used_capacity){
                        fileShare.storage = {"total":fileShareObj.usable_capacity,"used":fileShareObj.used_capacity,"percent_used":fileShareObj.pcnt_used};
                    }
                    clusterObj = utils.getClusterDetails(fileShareObj.cluster_id);
                    if(typeof clusterObj !== "undefined") {
                         fileShare.cluster_name = clusterObj.cluster_name || "NA";
                    }
                    fileShare.brick_count = fileShareObj.brick_count;
                    fileShare.alert_count = "NA"
                    fileShare.bricks = fileShareObj.bricks;
                    fileShareList.push(fileShare);
                }
            }
            return fileShareList;
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(volumeTimer);
        });

        function createFileShare() {
            //$state.go("add-inventory",{ clusterId: $scope.clusterId });
            $state.go("create-volume");
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

        function stopVolume(volume) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/file-share/stop-volume/stop-volume.html",
                controller: "StopVolumeController",
                controllerAs: "vm",
                size: "md",
                resolve: {
                    selectedVolume: function() {
                        return volume;
                    }
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});

            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }

        function startVolume(volume) {
            volumeStore.doActionOnVolume(volume, "start")
                .then(function(data) {
                    vm.jobId = data.job_id;
                });
        }

        function rebalanceVolume(volume) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/file-share/rebalance-volume/rebalance-volume.html",
                controller: "RebalanceVolumeController",
                controllerAs: "vm",
                size: "lg",
                resolve: {
                    selectedVolume: function() {
                        return volume;
                    }
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});

            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }

        function isRebalanceAllowed(volume) {
            return volume.type.startsWith("Distribute");
        }
    }

})();
