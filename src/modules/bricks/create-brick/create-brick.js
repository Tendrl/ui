(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("CreateBrickModalController", CreateBrickModalController);

    /*@ngInject*/
    function CreateBrickModalController($rootScope, $scope, $state, utils, brickStore) {

        var vm = this;

        vm.wizardSteps = [{
            "number": 1,
            "name": "General Settings"
        }, {
            "number": 2,
            "name": "Devices"
        }, {
            "number": 3,
            "name": "Review"
        }];

        vm.selectedStep = 1;
        vm.glusterClusterList = [];
        vm.brickPath = "/tendrl_gluster_bricks";
        vm.filterBy = "name";
        vm.isDataLoading = true;
        vm.brickName = "MyBrick";
        vm.selectedHost = [];
        vm.selectedDiskCount = 0;
        vm.taskSubmitted = false;
        vm.deviceFilterBy = {
            "property": "freeDevices.device",
            "value": ""
        };

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.next = next;
        vm.back = back;
        vm.expandList = expandList;
        vm.selectHost = selectHost;
        vm.isSelectedHost = isSelectedHost;
        vm.selectDisk = selectDisk;
        vm.isSelectedDisk = isSelectedDisk;
        vm.filterList = filterList;
        vm.filterDisk = filterDisk;
        vm.viewTaskProgress = viewTaskProgress;

        vm.modalHeader = {
            "title": "Create Bricks",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Back",
            "classname": "btn-default",
            "onCall": vm.back
        }, {
            "name": "Next",
            "classname": "btn-primary",
            "onCall": vm.next
        }];

        init();

        function init() {
            vm.glusterClusterList = [];
            vm.selectedHost = [];

            if (typeof $rootScope.clusterData !== "undefined") {
                vm.clusterList = JSON.parse(JSON.stringify($rootScope.clusterData.clusters));

                utils.getObjectList("Node")
                    .then(function(data) {
                        vm.hostList = data.nodes;
                        vm.isDataLoading = false;
                        _getGlusterClusterList();
                        vm.selectedCluster = vm.glusterClusterList[0];
                    });

            } else {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        vm.clusterList = JSON.parse(JSON.stringify($rootScope.clusterData.clusters));
                        return utils.getObjectList("Node");
                    })
                    .then(function(data) {
                        vm.hostList = data.nodes;
                        _getGlusterClusterList();
                        vm.isDataLoading = false;
                        vm.selectedCluster = vm.glusterClusterList[0];
                    });
            }
        }

        function cancelModal() {
            $state.go("file-share");
            $rootScope.$emit("modal.done", "cancel");
        }

        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        function next() {
            vm.selectedStep += 1;

            if (vm.selectedStep === 2) {
                _reset();
                _selectAllHost();
                _selectAllDisk();
                vm.expandList(true, vm.selectedHost);
            } else if (vm.selectedStep === 3) {
                vm.brickCreationHost = JSON.parse(JSON.stringify(vm.selectedHost));
                vm.deviceFilterBy = {
                    "property": "freeDevices.device",
                    "value": ""
                };
                _resetList(vm.brickCreationHost);
                _updateBrickCreationHost();
            } else if (vm.selectedStep === 4) {
                brickStore.createBrick(vm.brickCreationHost, vm.selectedCluster)
                    .then(function(data) {
                        vm.taskSubmitted = true;
                        vm.job = data.job_id;
                    });
            }
        }

        function back() {
            vm.selectedStep -= 1;

            if (vm.selectedStep === 2) {
                vm.deviceFilterBy = {
                    "property": "freeDevices.device",
                    "value": ""
                };
            }
        }

        function expandList(item, list) {
            if (typeof item === "boolean") {
                var len = list.length,
                    i;

                if (item) {
                    for (i = 0; i < len; i++) {
                        list[i].isExpanded = true;
                    }
                } else {
                    for (i = 0; i < len; i++) {
                        list[i].isExpanded = false;
                    }
                }

            } else if (typeof item === "object") {

                if (item.isExpanded) {
                    item.isExpanded = false;
                } else {
                    item.isExpanded = true;
                }
            }
        }

        function selectHost(host) {
            var hostIndex;

            if (host === "all") {

                if (vm.selectedHost.length < vm.selectedCluster.nodes.length) {
                    vm.selectedHost = vm.selectedCluster.nodes.slice(0);
                } else {
                    vm.selectedHost = [];
                }

            } else if (typeof host === "object") {
                hostIndex = vm.selectedHost.indexOf(host);

                if (hostIndex === -1) {
                    vm.selectedHost.push(host);
                } else {
                    vm.selectedHost.splice(hostIndex, 1);
                }
            }

            vm.allHostChecked = vm.selectedHost.length === vm.hostList.length;
        }

        function isSelectedHost(host) {
            return vm.selectedHost.indexOf(host) > -1;
        }

        function selectDisk(disk, host) {
            var diskIndex,
                len = 0;

            if (disk === "all") {

                if (host.selectedDisk.length < host.freeDevices.length) {
                    len = host.selectedDisk.length;
                    host.selectedDisk = host.freeDevices.slice(0);
                    vm.selectedDiskCount += host.freeDevices.length - len;
                } else {
                    host.selectedDisk = [];
                    vm.selectedDiskCount -= host.freeDevices.length;
                }

            } else if (typeof disk === "object") {
                diskIndex = host.selectedDisk.indexOf(disk);

                if (diskIndex === -1) {
                    host.selectedDisk.push(disk);
                    vm.selectedDiskCount += 1;
                } else {
                    host.selectedDisk.splice(diskIndex, 1);
                    vm.selectedDiskCount -= 1;
                }
            }

            host.allDiskChecked = host.selectedDisk.length === host.freeDevices.length;
            _updateHostProps(host);
        }

        function isSelectedDisk(disk, host) {
            return host.selectedDisk.indexOf(disk) > -1;
        }

        function filterList(item) {
            var properties,
                property,
                i,
                list = item.freeDevices,
                len = list.length;

            if (vm.deviceFilterBy.value) {

                properties = vm.deviceFilterBy.property.split(".");

                if (properties.length > 1) {
                    property = properties[1];

                    for (i = 0; i < len; i++) {
                        if (list[i][property].toLowerCase().indexOf(vm.deviceFilterBy.value.toLowerCase()) >= 0) {
                            item.isExpanded = true;
                            return item;
                        }
                    }

                } else {
                    property = vm.deviceFilterBy.property;

                    if (item[property].toLowerCase().indexOf(vm.deviceFilterBy.value.toLowerCase()) >= 0) {
                        return item;
                    }
                }

            } else {
                return item;
            }
        }

        function filterDisk(item) {
            var properties,
                property;

            if (vm.deviceFilterBy.value) {

                properties = vm.deviceFilterBy.property.split(".");

                if (properties.length > 1) {
                    property = properties[1];

                    if (item[property].toLowerCase().indexOf(vm.deviceFilterBy.value.toLowerCase()) >= 0) {
                        return item;
                    }
                }
            } else {
                return item;
            }
        }

        function viewTaskProgress() {
            $state.go("task-detail", { taskId: vm.jobId });
        }

        /*===================================Private Funtions==========================================*/

        function _reset() {
            vm.selectedDiskCount = 0;
        }

        function _selectAllHost() {
            vm.selectedHost = vm.selectedCluster.nodes.slice(0);
            vm.allHostChecked = vm.selectedHost.length === vm.hostList.length;
        }

        function _selectAllDisk() {
            var len = vm.selectedHost.length,
                i;

            for (i = 0; i < len; i++) {
                //vm.selectDisk("all", vm.selectedHost[i]);
                vm.selectedHost[i].selectedDisk = vm.selectedHost[i].freeDevices.slice(0);
                vm.selectedHost[i].allDiskChecked = vm.selectedHost[i].selectedDisk.length === vm.selectedHost[i].freeDevices.length;
                vm.selectedDiskCount += vm.selectedHost[i].selectedDisk.length;
                vm.selectedHost[i].freeDevicesCount = vm.selectedHost[i].selectedDisk.length;
            }
        }

        function _resetList(list) {
            var len = list.length,
                i;

            for (i = 0; i < len; i++) {
                list[i].isExpanded = false;
            }
        }

        function _updateBrickCreationHost() {
            var len = vm.brickCreationHost.length,
                diskLen,
                i,
                j;

            for (i = 0; i < len; i++) {
                if (vm.brickCreationHost[i] && !vm.brickCreationHost[i].selectedDisk.length) {
                    vm.brickCreationHost.splice(i, 1);
                    len--;
                    i--;
                } else {
                    diskLen = vm.brickCreationHost[i].selectedDisk.length;
                    for (j = 0; j < diskLen; j++) {
                        vm.brickCreationHost[i].selectedDisk[j].brickName = vm.brickName + (j + 1);
                        vm.brickCreationHost[i].selectedDisk[j].brickPath = vm.brickPath + "/" + vm.brickCreationHost[i].selectedDisk[j].brickName + "_mount/" + vm.brickCreationHost[i].selectedDisk[j].brickName;
                    }
                }
            }
        }

        function _selectDiskOfAllHost() {
            var len = vm.selectedHost.length,
                i;

            for (i = 0; i < len; i++) {
                vm.selectDisk("all", vm.selectedHost[i]);
            }
        }

        function _updateHostProps(host) {
            var len = host.selectedDisk.length,
                i;

            host.availableCapacity = 0;
            host.freeDevicesCount = host.selectedDisk.length;

            for (i = 0; i < len; i++) {
                host.availableCapacity += host.selectedDisk[i].size;
            }
        }

        function _getGlusterClusterList() {
            var i,
                len,
                clusterLen = vm.clusterList.length;

            for (i = 0; i < clusterLen; i++) {
                if (vm.clusterList[i].sds_name === "gluster") {
                    vm.glusterClusterList.push(vm.clusterList[i]);
                    len = vm.glusterClusterList.length;
                    _getHostData(vm.clusterList[i], len - 1);
                }
            }
        }

        function _getHostData(cluster, index) {
            var nodes = Object.keys(cluster.nodes),
                len = nodes.length,
                hostLen = vm.hostList.length,
                i,
                j;

            vm.glusterClusterList[index].nodes = [];

            for (i = 0; i < len; i++) {
                for (j = 0; j < hostLen; j++) {
                    if (vm.hostList[j].node_id === nodes[i]) {
                        _updateHost(vm.hostList[j]);
                        vm.glusterClusterList[index].nodes.push(vm.hostList[j]);
                    }
                }
            }

        }

        function _updateHost(host) {

            if (!host.disks) {
                host.freeDevices = [];
                host.availableCapacity = 0;
            } else {
                host.freeDevices = host.disks.free ? _getFreeDevices(host) : [];
                host.availableCapacity = host.disks.free ? _getCapacity(host) : 0;
            }

            host.selectedDisk = [];
        }

        function _getFreeDevices(host) {
            var keys = host.blockdevices.free,
                len = keys.length,
                disks = host.disks,
                temp,
                conf = [],
                i,
                disk;

            for (i = 0; i < len; i++) {
                for (disk in disks) {
                    if (disks[disk].disk_name && disks[disk].disk_name === keys[i]) {
                        temp = {};
                        temp.device = disks[disk].disk_name;
                        temp.size = parseInt(disks[disk].size) || 0;
                        temp.ssd = (disks[disk].ssd === "True") ? "SSD" : "HDD";
                        conf.push(temp);
                    }
                }
            }
            return conf;
        }

        function _getCapacity(host) {
            var keys = host.blockdevices.free,
                len = keys.length,
                disks = host.disks,
                size = 0,
                i,
                disk;

            for (i = 0; i < len; i++) {
                for (disk in disks) {
                    if (disks[disk].disk_name && disks[disk].disk_name === keys[i]) {
                        size += parseInt(disks[disk].size);
                    }
                }
            }
            return size;
        }

    }

})();
