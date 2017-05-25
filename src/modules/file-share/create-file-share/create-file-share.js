(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createFileShareController", createFileShareController);

    /*@ngInject*/
    function createFileShareController($scope, $state, $rootScope, $uibModal, nodeStore, utils, volumeCreationMapping) {
        var vm = this,
            multipleOfTwoBricksCount = 0;

        vm.step = 1;
        vm.settings = {};
        vm.updateStep = updateStep;
        vm.updateSettingsStep = updateSettingsStep;
        vm.updateProtocol = updateProtocol;
        vm.isSelectedProtocol = isSelectedProtocol;
        vm.updateTransportType = updateTransportType;
        vm.cancelCreate = cancelCreate;
        vm.createFileShare = createFileShare;
        vm.goToFileShareCreateView = goToFileShareCreateView;
        vm.viewTaskProgress = viewTaskProgress;
        vm.onCreateBrickModal = onCreateBrickModal;
        vm.changeSelectedCluster = changeSelectedCluster;
        vm.validateAvaialbleBricks = validateAvaialbleBricks;
        vm.selectHostsCheckBox = selectHostsCheckBox;
        vm.multipleOfTwoBricks = multipleOfTwoBricks;
        vm.expandList = expandList;
        vm.getBrickPath = getBrickPath;
        vm.checkNumberOfSelectedNodes = checkNumberOfSelectedNodes;

        vm.taskSubmitted = false;
        vm.glusterClusterList = [];
        vm.fileShareTypes = ["Distributed Replicated"];
        vm.totalBricks = 0;
        vm.hostAllCheckBoxSelected = true;
        vm.isDataLoading = true;
        vm.nodeDataLoading = true;
        vm.exceededNumberOfNodes = false;
        vm.enableError = false;


        vm.settings = {
            protocol: "gluster",
            step: 1,
        };

        vm.wizardSteps = [{
            "number": 1,
            "name": "General Settings"
        }, {
            "number": 2,
            "name": "Hosts"
        }, {
            "number": 3,
            "name": "Bricks Layout"
        }, {
            "number": 4,
            "name": "General Settings"
        }, {
            "number": 5,
            "name": "Review"
        }];

        //default values
        vm.fileShareName = "GlusterVolume";
        vm.replicaCount = 2;
        vm.distributionCount = 1;
        vm.isNextButtonDisabled = false;
        vm.allDiskChecked = false;

        init();

        function init() {
            vm.isDataLoading = true;
            utils.getObjectList("Cluster")
                .then(function(data) {
                    vm.isDataLoading = false;
                    _getGlusterClusterList();
                });
        }


        function changeSelectedCluster() {
            _setValuesForDropdowns();
            _getNodesWithFreeBricks(vm.selectedCluster);
        }

        function selectHostsCheckBox(totalAvailableHosts) {
            var hostNames = Object.keys(totalAvailableHosts),
                i,
                hostNamesLen = hostNames.length,
                repDistrib = (vm.replicaCount * vm.distributionCount),
                numberOfNodesToBeSelected;

            if (vm.hostAllCheckBoxSelected) {
                numberOfNodesToBeSelected = hostNamesLen > repDistrib ? repDistrib : hostNamesLen;
                multipleOfTwoBricksCount = numberOfNodesToBeSelected;
                for (i = 0; i < hostNamesLen; i++) {
                    totalAvailableHosts[hostNames[i]].hostCheckBoxSelected = false;
                }
                for (i = 0; i < numberOfNodesToBeSelected; i++) {
                    totalAvailableHosts[hostNames[i]].hostCheckBoxSelected = true;
                }
            } else {
                _deselectNodes();
            }
        }

        function validateAvaialbleBricks() {
            return (vm.replicaCount * vm.distributionCount) > vm.totalBricks;
        }

        function multipleOfTwoBricks() {
            var count = _countNumberOfNodesSelected();
            vm.selectMultipleOfTwo = count % 2 === 0 && count > 1 ? false : true;
            return vm.selectMultipleOfTwo;
        }

        function checkNumberOfSelectedNodes(node) {
            var count = _countNumberOfNodesSelected();
            if (count > (vm.replicaCount * vm.distributionCount)) {
                node.hostCheckBoxSelected = false;
                return vm.exceededNumberOfNodes = true;
            }
            return vm.exceededNumberOfNodes = false;
        }

        function updateStep(step) {
            var postData;
            if (step === "inc") {
                vm.step += 1;
                if (vm.step === 6) {
                    postData = _createVolumePostData();
                    _sendPostCall(postData);
                } else if (vm.step === 2) {
                    selectHostsCheckBox(vm.selectedCluster.nodes);
                } else if (vm.step === 3) {
                    vm.nodeDataLoading = true;
                    _getVolumeCreationMapping();
                } else if (vm.step === 5) {
                    _postData();
                }

            } else if (step === "dec") {
                vm.step -= 1;
                if (vm.step === 4) {
                    vm.settings.step = 1;
                } else if (vm.step === 1) {
                    vm.selectMultipleOfTwo = false;
                    vm.exceededNumberOfNodes = false;
                }
            }
        }

        function updateSettingsStep(step) {

            if (step === "inc") {

                vm.settings.step += 1;

                if (vm.settings.step === 2) {
                    vm.step = 5;
                }

            } else if (step === "dec") {
                if (vm.settings.step === 1) {
                    vm.step = 3;
                } else {
                    vm.settings.step -= 1;
                }
            }
        }

        function expandList(item) {
            if (item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
        }

        function getBrickPath(brick) {
            return Object.values(brick)[0];
        }

        function updateProtocol(protocol) {
            vm.settings.protocol = protocol;
        }

        function updateTransportType(type) {
            var typeIndex;

            typeIndex = vm.settings.transportType.indexOf(type);

            if (typeIndex === -1) {
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

        function viewTaskProgress() {
            $state.go("task-detail", { taskId: vm.jobId });
        }

        function cancelCreate() {
            $state.go("file-share");
        }

        function goToFileShareCreateView() {
            $state.go("create-file-share", {}, { reload: true });
        }

        function onCreateBrickModal(clusterData) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/bricks/create-brick/create-brick.html",
                controller: "CreateBrickModalController",
                controllerAs: "vm",
                size: "lg",
                resolve: {
                    clusterData: function() {
                        return clusterData;
                    },
                    selectedCluster: function() {
                        return vm.selectedCluster;
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

        // Private function

        function _countNumberOfNodesSelected() {
            var count = 0,
                availableHost;
            for (availableHost in vm.selectedCluster.nodes) {
                if (vm.selectedCluster.nodes[availableHost].hostCheckBoxSelected) {
                    count += 1;
                }
            }
            return count;
        }


        function _deselectNodes() {
            var availableHost;
            for (availableHost in vm.selectedCluster.nodes) {
                vm.selectedCluster.nodes[availableHost].hostCheckBoxSelected = false;
            }
        }

        function _getGlusterClusterList() {
            var index,
                clustersLength;

            clustersLength = $rootScope.clusterData.clusters.length;
            for (index = 0; index < clustersLength; index++) {
                if ($rootScope.clusterData.clusters[index].sds_name === "gluster") {
                    vm.glusterClusterList.push($rootScope.clusterData.clusters[index]);
                }
            }
            vm.changeSelectedCluster();
        }

        function _setValuesForDropdowns() {
            vm.selectedCluster = vm.glusterClusterList[0];
            vm.selectedType = vm.fileShareTypes[0];
        }

        function _getNodesWithFreeBricks(selectedCluster) {
            var totalAvailableHosts,
                availableHost;

            if (selectedCluster) {
                totalAvailableHosts = selectedCluster.nodes;
                for (availableHost in totalAvailableHosts) {
                    _checkBrickLen(totalAvailableHosts, availableHost)
                }
            }
        }

        function _checkBrickLen(totalAvailableHosts, availableHost) {
            totalAvailableHosts[availableHost].bricksAvaialble = 0;
            if (totalAvailableHosts[availableHost].bricks && totalAvailableHosts[availableHost].bricks.free) {
                totalAvailableHosts[availableHost].bricksAvaialble = totalAvailableHosts[availableHost].bricks.free.length;
                if (totalAvailableHosts[availableHost].bricksAvaialble) {
                    vm.totalBricks += totalAvailableHosts[availableHost].bricks.free.length;
                } else {
                    delete totalAvailableHosts[availableHost];
                }
            } else {
                delete totalAvailableHosts[availableHost];
            }
        }

        function _getVolumeCreationMapping() {
            vm.volumeMapping = volumeCreationMapping.mapping;
            _validateVolumeMapping();
            _validateStep();
        }

        function _validateVolumeMapping() {
            var repDistribKey,
                expectedBrickCountArray,
                generatedBrickCountArray;

            repDistribKey = vm.replicaCount + "_" + vm.distributionCount
            expectedBrickCountArray = _createBricksCountArray();
            generatedBrickCountArray = vm.volumeMapping[repDistribKey][_countNumberOfNodesSelected()];
            vm.validateBrickCountArrayBool = _validateBrickCountArray(expectedBrickCountArray, generatedBrickCountArray);
        }

        function _createBricksCountArray() {
            var availableNodesForBrickCreation = vm.selectedCluster.nodes,
                brickCountArray = [],
                availableNode;
            for (availableNode in availableNodesForBrickCreation) {
                if (availableNodesForBrickCreation[availableNode].hostCheckBoxSelected) {
                    brickCountArray.push(availableNodesForBrickCreation[availableNode].bricksAvaialble);
                }
            }
            return brickCountArray
        }

        function _validateBrickCountArray(expectedBrickCountArray, generatedBrickCountArray) {
            var i,
                j,
                count = 0,
                brickMappingValidation = true,
                brickCountLen = expectedBrickCountArray.length,
                generatedBrickCountArrayLen = generatedBrickCountArray.length;

            expectedBrickCountArray.sort(function(a, b) {
                return b - a
            });

            for (j = 0; j < generatedBrickCountArrayLen; j++) {
                count = 0
                for (i = 0; i < brickCountLen; i++) {
                    if (expectedBrickCountArray[i] < generatedBrickCountArray[j][i]) {
                        count += 1;
                        break;
                    }
                }
                if (count === 0) {
                    return true;
                }
            }
            if (count === generatedBrickCountArrayLen) {
                return false;
            }

        }

        function _validateStep() {
            if (vm.validateBrickCountArrayBool) {
                _getNodeList();
            } else {
                vm.step = 2;
                vm.nodeDataLoading = false;
                vm.enableError = true;
            }
        }

        function _getNodeList() {
            vm.hostDetails = [];
            vm.brickList = [];
            vm.brickDetails = [];
            nodeStore.getNodeList()
                .then(function(data) {
                    vm.nodeDataLoading = false;
                    vm.hostList = data;
                    _createHostDetails();
                    _createBrickList();
                    _createBucketList();
                });
        }

        function _createBucketList() {
            var n = 0,
                i,
                j,
                bucket;

            for (i = 0; i < vm.distributionCount; i++) {
                bucket = [];

                for (j = 0; j < vm.replicaCount; j++) {
                    bucket.push(vm.brickList[n]);
                    n += 1;
                }
                vm.brickDetails.push({ bricks: bucket });
            }
            _reviewPageDetails();

        }

        function _createBrickList() {
            var hostLen = vm.hostDetails.length,
                brickLen,
                i,
                j = 0,
                fails = 0,
                ip,
                tmp;

            while (1) {
                fails = 0;
                for (i = 0; i < hostLen; i++) {
                    ip = Object.keys(vm.hostDetails[i])[0];
                    brickLen = vm.hostDetails[i][ip].length;

                    if (j < brickLen) {
                        tmp = {};
                        tmp[ip] = vm.hostDetails[i][ip][j];
                        vm.brickList.push(tmp);
                    } else {
                        fails += 1;
                    }
                }

                if (fails >= hostLen)
                    break;

                j += 1;
            }


        }

        function _createHostDetails() {
            var keys = Object.keys(vm.selectedCluster.nodes),
                len = keys.length,
                ip,
                temp,
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                ip = _getNodeIP(keys[i]);
                temp[ip] = vm.selectedCluster.nodes[keys[i]].bricks.free ? vm.selectedCluster.nodes[keys[i]].bricks.free : [];
                vm.hostDetails.push(temp);
            }


        }

        function _getNodeIP(nodeId) {
            var len = vm.hostList.length,
                netkeys,
                i;

            for (i = 0; i < len; i++) {
                if (vm.hostList[i].node_id === nodeId) {
                    netkeys = Object.keys(vm.hostList[i].networks);
                    return JSON.parse(vm.hostList[i].networks[netkeys[0]].ipv4)[0];
                }
            }
        }

        function _createVolumePostData() {
            var createVolumePostRequest = {};
            createVolumePostRequest["Volume.volname"] = vm.fileShareName;
            createVolumePostRequest["Volume.bricks"] = _manupulateBrickDetails(vm.brickDetails);
            createVolumePostRequest["Volume.replica_count"] = vm.replicaCount;
            return createVolumePostRequest;
        }

        function _manupulateBrickDetails(brickDetails) {
            var brickList = [],
                i,
                brickDetailLen = brickDetails.length;
            for (i = 0; i < brickDetailLen; i++) {
                brickList.push(brickDetails[i].bricks);
            }
            return brickList;
        }

        function _sendPostCall(postData) {
            utils.createVolume(postData, vm.selectedCluster)
                .then(function(data) {
                    vm.jobId = data.job_id;
                    vm.createFileShare();
                });
        }

        function _reviewPageDetails() {
            var i,
                bricksLen = vm.brickDetails.length,
                totalBricks = 0;

            for (i = 0; i < bricksLen; i++) {
                totalBricks += vm.brickDetails[i].bricks.length;
            }
            vm.showReplicaSets = bricksLen;
            vm.showTotalBricks = totalBricks;
        }
    }

})();
