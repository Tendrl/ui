(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createVolumeController", createVolumeController);

    /*@ngInject*/
    function createVolumeController($scope, $state, $rootScope, $uibModal, $interval, config, nodeStore, utils, volumeCreationMapping, brickStore) {
        var vm = this,
            brickMappingTimer,
            brickMappingCounter = 0;

        vm.step = 1;
        vm.settings = {};

        vm.taskSubmitted = false;
        vm.hostAllCheckBoxSelected = true;
        vm.isDataLoading = true;
        vm.nodeDataLoading = true;
        vm.buttonEnabled = false;
        vm.glusterClusterList = [];
        vm.totalBrickSize = 0;
        vm.totalBricks = 0;
        vm.volumeName = "GlusterVolume";
        vm.volumeTypes = ["3-Way Distributed Replicated", "Erasure-Coded (Distributed Dispersed)"];
        vm.ecProfiles = ["4+2", "8+3", "8+4"];
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
        vm.valueMapping = {
            "3-Way Distributed Replicated": 3,
            "4+2": 6,
            "8+3": 11,
            "8+4": 12
        };

        vm.updateStep = updateStep;
        vm.updateSettingsStep = updateSettingsStep;
        vm.updateProtocol = updateProtocol;
        vm.isSelectedProtocol = isSelectedProtocol;
        vm.updateTransportType = updateTransportType;
        vm.cancelCreate = cancelCreate;
        vm.goToVolumeCreateView = goToVolumeCreateView;
        vm.viewTaskProgress = viewTaskProgress;
        vm.onCreateBrickModal = onCreateBrickModal;
        vm.changeSelectedCluster = changeSelectedCluster;
        vm.validateAvaialbleBricks = validateAvaialbleBricks;
        vm.selectHostsCheckBox = selectHostsCheckBox;
        vm.minimumThreeHostSelected = minimumThreeHostSelected;
        vm.markTopLevelCheckbox = markTopLevelCheckbox;
        vm.expandList = expandList;
        vm.sendglusterBrickMappingPostReq = sendglusterBrickMappingPostReq;

        init();

        /* Calls the get cluster list and
        set the flags accordingly */
        function init() {
            vm.isDataLoading = true;
            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    vm.isDataLoading = false;
                    _getGlusterClusterList();
                });
        }

        /* Step-1: Select value for dropdowns and
        makes a function call for collecting nodes
        with free bricks */
        function changeSelectedCluster() {
            _setValuesForDropdowns();
            _getNodesWithFreeBricks(vm.selectedCluster);
            validateAvaialbleBricks();
        }

        /* Step-1: Validate total bricks and
        total number of hosts avaiable */
        function validateAvaialbleBricks() {
            if (vm.selectedType === vm.volumeTypes[0]) {
                vm.nodeRequired = vm.valueMapping[vm.selectedType];
                vm.validateAvailablebricks = vm.valueMapping[vm.selectedType] > vm.totalBricks;
                vm.validateTotalHosts = vm.valueMapping[vm.selectedType] > Object.keys(vm.selectedCluster.nodes).length;
            } else if (vm.selectedType === vm.volumeTypes[1]) {
                vm.nodeRequired = vm.valueMapping[vm.selectedProfile];
                vm.validateAvailablebricks = vm.valueMapping[vm.selectedProfile] > vm.totalBricks;
                vm.validateTotalHosts = vm.valueMapping[vm.selectedProfile] > Object.keys(vm.selectedCluster.nodes).length;
            }

            vm.buttonEnabled = vm.validateAvailablebricks || vm.validateTotalHosts;
        }
        /* Step-2: Selecting the checkboxes
        on basis of top level checkbox */
        function selectHostsCheckBox() {
            var availableHost;
            for (availableHost in vm.selectedCluster.nodes) {
                vm.selectedCluster.nodes[availableHost].hostCheckBoxSelected = vm.hostAllCheckBoxSelected;
            }
        }

        /* Step-2: Three hosts shoud be selected
        and sets flag accordingly */
        function minimumThreeHostSelected() {
            var count = _countNumberOfNodesSelected();
            vm.buttonEnabled = vm.nodeRequired > count;
            return vm.buttonEnabled;
        }

        /* Step-2: Select or de-select
        on the basis of top level checkbox */
        function markTopLevelCheckbox() {
            var count = _countNumberOfNodesSelected();
            if (Object.keys(vm.selectedCluster.nodes).length === count) {
                vm.hostAllCheckBoxSelected = true
            } else {
                vm.hostAllCheckBoxSelected = false;
            }
        }

        /* Step-3: Sends the request for getting
        the Bricks mapping for the selected nodes */
        function sendglusterBrickMappingPostReq() {
            var brickMappingJobId,
            subVolume;
            brickMappingCounter = 0;
            vm.nodeDataLoading = true;
            vm.buttonEnabled = true;
            vm.brickPerHostDropdown = true;

            if (vm.selectedType === vm.volumeTypes[0]) {
                subVolume = vm.valueMapping[vm.selectedType];
            } else if (vm.selectedType === vm.volumeTypes[1]) {
                subVolume = vm.valueMapping[vm.selectedProfile];
            }
            brickStore.glusterBrickMapping(vm.selectedCluster, vm.selectedSubVolume, subVolume)
                .then(function(data) {
                    brickMappingJobId = data.job_id;
                    _startBrickMappingTimer(brickMappingJobId);
                });
        }

        /* Step-4: Update "Advance setting" steps
        on basis of step parameter */
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

        /* Increment or decrement the step,
        According to the step value passed in fuction */
        function updateStep(step) {
            var postData;
            if (step === "inc") {
                vm.step += 1;
                if (vm.step === 6) {
                    postData = _createVolumePostData();
                    _sendPostCall(postData);
                } else if (vm.step === 2) {
                    vm.hostAllCheckBoxSelected = true;
                    selectHostsCheckBox();
                } else if (vm.step === 3) {
                    _maxBrickPerHost();
                    vm.sendglusterBrickMappingPostReq();
                }

            } else if (step === "dec") {
                vm.step -= 1;
                if (vm.step === 4) {
                    vm.settings.step = 1;
                }
            }
        }

        /* Step-3: Expand and collapse the Brick Mapping table */
        function expandList(item) {
            if (item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
        }

        /* Step-4: updating the protocol value in
        advance settings*/
        function updateProtocol(protocol) {
            vm.settings.protocol = protocol;
        }

        /* Step-4: updating the Transport Type value in
        advance settings*/
        function updateTransportType(type) {
            var typeIndex;

            typeIndex = vm.settings.transportType.indexOf(type);

            if (typeIndex === -1) {
                vm.settings.transportType.push(type);
            } else {
                vm.settings.transportType.splice(typeIndex, 1)
            }
        }

        /* Invoked when task is submitted to show the
        Task submitted page */
        function _createVolume() {
            vm.taskSubmitted = true;
        }

        /* Returns bool value if value for protocol is equal */
        function isSelectedProtocol(protocol) {
            return protocol === vm.settings.protocol;
        }

        /* Return bool value  */
        function isSelectedType(type) {
            return vm.settings.transportType.indexOf(type) > -1;
        }

        /* Takes you to task progress page after
        submitting the create Volume Job */
        function viewTaskProgress() {
            $state.go("task-detail", { taskId: vm.jobId });
        }

        /* Cancel the Volume creation wizard and
        takes you to Volume List page */
        function cancelCreate() {
            $state.go("file-share");
        }

        /* TaskProgress: This function will be invoked
        when you want to create a another Volume */
        function goToVolumeCreateView() {
            $state.go("create-volume", {}, { reload: true });
        }

        /* Step-4: Opens the create brick wizard
        with the selected cluster */
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


        /* Counts the number of selected nodes */
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

        /* Get the Gluster cluster and push it to "glusterClusterList" */
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

        /* Set default values for dropdown */
        function _setValuesForDropdowns() {
            vm.selectedCluster = vm.glusterClusterList[0];
            vm.selectedType = vm.volumeTypes[0];
            vm.selectedProfile = vm.ecProfiles[0];
        }

        /* Get the nodes which has free bricks available */
        function _getNodesWithFreeBricks(selectedCluster) {
            var totalAvailableHosts,
                availableHost;
            vm.totalBricks = selectedCluster.bricks ? Object.keys(selectedCluster.bricks.free).length : 0;
            if (selectedCluster && vm.totalBricks) {
                totalAvailableHosts = selectedCluster.nodes;
                for (availableHost in totalAvailableHosts) {
                    totalAvailableHosts[availableHost].bricksAvaialble = 0;
                    totalAvailableHosts[availableHost].rawCapacity = 0;
                    _checkBrickLen(selectedCluster, totalAvailableHosts, availableHost)
                }
            }
        }

        /* Counts the bricks in node and check for brick length in node
        and if the free brick length is equal to zero then delete that 
        host from totalAvailableHosts */
        function _checkBrickLen(selectedCluster, totalAvailableHosts, availableHost) {
            var i,
                freeBricksObj = selectedCluster.bricks.free;
            for (var brick in freeBricksObj) {
                if (availableHost === freeBricksObj[brick].node_id) {
                    totalAvailableHosts[availableHost].bricksAvaialble += 1;
                    totalAvailableHosts[availableHost].rawCapacity += parseInt(freeBricksObj[brick].size);
                }
            }
            if (!totalAvailableHosts[availableHost].bricksAvaialble) {
                delete totalAvailableHosts[availableHost];
            }
        }

        /* Step-3: Counts the bricks per node and finds
        the min bricks to set the maximum value of 
        Bricks per node*/
        function _maxBrickPerHost() {
            var node,
                allNodes = vm.selectedCluster.nodes,
                brickPerNodeArray = [];
            for (node in allNodes) {
                if (allNodes[node].hostCheckBoxSelected === true) {
                    brickPerNodeArray.push(allNodes[node].bricksAvaialble);
                }
            }
            vm.maxBricksPerHost = Math.min.apply(null, brickPerNodeArray);
            vm.bricksPerHostValues = _createBricksPerHostArray(vm.maxBricksPerHost);
            vm.selectedSubVolume = vm.bricksPerHostValues[0];
        }

        /* Step-3: Counts bricks per host to set the value 
        of BricksPerHost dropdown */
        function _createBricksPerHostArray(maxBricksPerHost) {
            var arr = [];
            for (var i = 1; i <= maxBricksPerHost; i++) {
                arr.push(i);
            }
            return arr;
        }

        /* Step-4: Sends request for getting the job status
        and starts timer */
        function _startBrickMappingTimer(brickMappingJobId) {
            brickMappingTimer = $interval(function() {
                utils.getTaskStatus(brickMappingJobId)
                    .then(function(data) {
                        $interval.cancel(brickMappingTimer);
                        _checkCounterValue(data, brickMappingJobId);
                    });

            }, 1000 * config.statusRefreshIntervalTime, 1);
        }
        /* Step-3: Checks the counter value of the job status api call
        if the job remains in new or processing state after 25 calls it
        says to try again */
        function _checkCounterValue(data, brickMappingJobId) {
            if (data.status !== "finished") {
                if (brickMappingCounter < 25 && data.status !== "failed") {
                    _startBrickMappingTimer(brickMappingJobId);
                    brickMappingCounter++;
                } else {
                    vm.nodeDataLoading = false;
                    vm.brickMappingErrorMsg = "Not able to get the Brick mapping."
                    vm.showBrickMappingErrorMsg = true;
                    vm.buttonEnabled = true;
                    vm.brickPerHostDropdown = false;
                }
            } else {
                _getBrickMappingOutput(brickMappingJobId);
            }
        }

        /* If job status for BrickMapping is finished then 
        this function is called and returns the Bricks Mapping */
        function _getBrickMappingOutput(brickMappingJobId) {
            brickStore.getTaskOutput(brickMappingJobId)
                .then(function(data) {
                    vm.optimal = data.optimal;
                    vm.brickMapping = _structureBrickMappingData(data.result);
                    vm.nodeDataLoading = false;
                    vm.buttonEnabled = false;
                    vm.brickPerHostDropdown = false;
                    vm.showBrickMappingErrorMsg = false;
                });
        }

        /* Structure the Brick Mapping data to feed it to the UI
        and the Post request */
        function _structureBrickMappingData(brickMappingData) {
            var brickMapping = [],
                postBrickMapping = [],
                brickNameArr,
                brickMappingDataLen = brickMappingData.length,
                i,
                j;

            vm.totalBrickSize = 0;
            vm.totalBrickCount = 0;

            for (i = 0; i < brickMappingDataLen; i++) {
                var brickMappingSet = [],
                    postBrickMappingSet = [],
                    bricksLen = brickMappingData[i].length;
                    vm.totalBrickCount += bricksLen;
                for (j = 0; j < bricksLen; j++) {
                    var brickValues = {},
                        postBrickValues = {},
                        fullBrickName = brickMappingData[i][j].toLowerCase();

                    brickNameArr = fullBrickName.split(":");
                    postBrickValues[brickNameArr[0]] = vm.selectedCluster.bricks.all[fullBrickName].brick_path;
                    brickValues["name"] = fullBrickName;
                    brickValues["capacity"] = vm.selectedCluster.bricks.free[fullBrickName].size || "NA";
                    brickValues["device"] = vm.selectedCluster.bricks.free[fullBrickName].disk || "NA";
                    vm.totalBrickSize += parseInt(brickValues["capacity"]);
                    brickMappingSet.push(brickValues);
                    postBrickMappingSet.push(postBrickValues);
                }
                brickMapping.push(brickMappingSet);
                postBrickMapping.push(postBrickMappingSet);
            }
            vm.brickLayoutInfo = brickMappingDataLen + " Replica Sets (" + vm.totalBrickCount + " Bricks with " + vm.nodeRequired + " Bricks per Replica Set)"
            vm.postBrickMapping = postBrickMapping;
            return brickMapping;
        }

        /* Creates the post request data for the Volume creation */
        function _createVolumePostData() {
            var createVolumePostRequest = {},
                ecProfile;

            createVolumePostRequest["Volume.volname"] = vm.volumeName;
            createVolumePostRequest["Volume.bricks"] = vm.postBrickMapping;
            createVolumePostRequest["Volume.force"] = true;
            if (vm.selectedType === "3-Way Distributed Replicated") {
                createVolumePostRequest["Volume.replica_count"] = vm.valueMapping[vm.selectedType];
            } else {
                ecProfile = vm.selectedProfile.split("+");
                createVolumePostRequest["Volume.disperse_count"] = ecProfile[0];
                createVolumePostRequest["Volume.redundancy_count"] = ecProfile[1];
            }

            return createVolumePostRequest;
        }

        /* Sends the Post request to the Volume creation endpoint */
        function _sendPostCall(postData) {
            utils.createVolume(postData, vm.selectedCluster)
                .then(function(data) {
                    vm.jobId = data.job_id;
                    _createVolume();
                });
        }
    }

})();
