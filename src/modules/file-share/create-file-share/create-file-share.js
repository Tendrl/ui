(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createFileShareController", createFileShareController);

    /*@ngInject*/
    function createFileShareController($scope, $state, utils, $rootScope) {
        var vm = this;

        vm.step = 1;
        vm.settings = {};
        vm.updateStep = updateStep;
        vm.createBrick = createBrick;
        vm.showBModal = showBModal;
        vm.selectDisk = selectDisk;
        vm.isSelectedDisk = isSelectedDisk;
        vm.resetValues = resetValues;
        vm.updateSettingsStep = updateSettingsStep;
        vm.updateProtocol = updateProtocol;
        vm.isSelectedProtocol = isSelectedProtocol;
        vm.updateTransportType = updateTransportType;
        vm.isSelectedType = isSelectedType;
        vm.cancelCreate = cancelCreate;
        vm.createFileShare = createFileShare;
        vm.goToFileShareCreateView = goToFileShareCreateView;
        vm.viewTaskProgress = viewTaskProgress;

        vm.taskSubmitted = false;
        vm.diskList = [];
        vm.brickModalVisible = false;
        vm.glusterClusterList = [];
        vm.fileShareTypes = ["2-Way Distributed Replicated", "3-Way Distributed Replicated", "Erasure-Coded (Distributed Dispersed)"];
        vm.ecProfiles = ["4+2", "8+3", "8+4"];
        vm.diskConfs = ["RAID 6", "RAID 10", "JBODs"];

        vm.brickInfo = {
            devicesPerBrick: 1,
            brickName: "MyBrick",
            diskCount: 2,
            stripeSize: 128,
            selectedDiskConf: vm.diskConfs[0],
            //brickCount: 0,
            brickNames: [],
            selectedDisks: []
        };

        vm.settings = {
            protocol: "gluster",
            step: 1,
            transportType: ["tcp"],
            accessFrom: "*"
        };

        vm.settings.optimizedOptions = ["Archival", "Containers", "DSS/Analytics", "File Sharing(Default)", "Home directories", "OLTP Databases", "Streaming Media", "Web Hosting", "Virtualization"];
        vm.settings.selectedOption = "File Sharing(Default)";

        //default values
        vm.fileShareName = "GlusterVolume";
        vm.replicaCount = 2;
        vm.isNextButtonDisabled = false;
        vm.allDiskChecked = false;

        if ($rootScope.clusterData !== null && typeof $rootScope.clusterData !== "undefined") {
            init();
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0) {
                $state.go("home");
            } else {
                init();
            }
        });

        function updateStep(step) {
            
            if (step === "inc") {

                vm.step += 1;

                if (vm.step === 5) {
                    vm.createFileShare();
                }

            } else if (step === "dec") {
                vm.step -= 1;
            }
        }

        function updateSettingsStep(step) {
            
            if (step === "inc") {

                vm.settings.step += 1;

                if (vm.settings.step === 3) {
                    vm.step = 4;
                }

            } else if (step === "dec") {
                if(vm.settings.step === 1) {
                    vm.step = 2;
                } else {
                    vm.settings.step -= 1;
                }
            }
        }

        function updateProtocol(protocol) {
            vm.settings.protocol = protocol;
        }

        function updateTransportType(type) {
            var typeIndex;

            typeIndex = vm.settings.transportType.indexOf(type);

            if(typeIndex === -1) {
                vm.settings.transportType.push(type);
            } else {
                vm.settings.transportType.splice(typeIndex, 1)   
            }
        }

        function createFileShare() {
            vm.taskSubmitted = true;
        }

        function isSelectedProtocol(protocol) {
            return protocol === vm.settings.protocol;
        }

        function isSelectedType(type) {
            return vm.settings.transportType.indexOf(type) > -1;
        }

        function init() {

            if (typeof $rootScope.clusterData !== "undefined") {
                getGlusterClusterList();
                getDiskList();
            } else {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        getGlusterClusterList();
                        getDiskList();
                    });
            }
            vm.selectedCluster = vm.glusterClusterList[0];
            vm.selectedType = vm.fileShareTypes[0];
            vm.selectedProfile = vm.ecProfiles[0];
            vm.selectedDiskConf = vm.diskConfs[0];
        }

        function getDiskList() {
            utils.getObjectList("Disk")
                .then(function(data) {
                    vm.diskList = data.disks;
                });
        }

        function getGlusterClusterList() {
            var index, clustersLength;

            clustersLength = $rootScope.clusterData.clusters.length;
            for (index = 0; index < clustersLength; index++) {
                if ($rootScope.clusterData.clusters[index].sds_name === "glusterfs") {
                    vm.glusterClusterList.push($rootScope.clusterData.clusters[index]);
                }
            }

            vm.glusterClusterList = ["gluster1", "gluster2", "gluster3"];
        }

        function createBrick() {
            vm.createBrickTaskSubmitted = true;
            $("#createBrickModal").modal("hide");
            vm.resetValues();
        }

        function showBModal() {
            vm.brickModalVisible = true;
        }

        function selectDisk(disk) {
            
            var diskIndex;

            if (disk === "all") {
                if (vm.brickInfo.selectedDisks.length < vm.diskList.length) {
                    vm.brickInfo.selectedDisks = vm.diskList.slice(0);
                } else {
                    vm.brickInfo.selectedDisks = [];
                }

            } else if (typeof disk === "object") {
                diskIndex = vm.brickInfo.selectedDisks.indexOf(disk);

                if (diskIndex === -1) {
                    vm.brickInfo.selectedDisks.push(disk);
                } else {
                    vm.brickInfo.selectedDisks.splice(diskIndex, 1);
                }
            }

            vm.allDiskChecked = vm.brickInfo.selectedDisks.length === vm.diskList.length;
            _updateBrickNames();
        }

        function _updateBrickNames() {
            var len = vm.brickInfo.selectedDisks.length,
                i;

            vm.brickInfo.brickNames = [];

            for (i = 0; i < len; i++) {
                vm.brickInfo.brickNames.push(vm.brickInfo.brickName + (i+1));
            }

        }

        function isSelectedDisk(disk) {
            return vm.brickInfo.selectedDisks.indexOf(disk) > -1;
        }

        function resetValues() {
            vm.brickInfo = {
                devicesPerBrick: 1,
                brickName: "MyBrick",
                diskCount: 2,
                stripeSize: 128,
                selectedDiskConf: vm.diskConfs[0],
                //brickCount: 0,
                brickNames: [],
                selectedDisks: []
            };

            vm.allDiskChecked = false;
        }

        function viewTaskProgress() {
            $state.go("task");
        }

        function cancelCreate() {
            $state.go("file-share");
        }

        function goToFileShareCreateView() {
            $state.go("create-file-share", {}, {reload: true});
        }

    }

})();
