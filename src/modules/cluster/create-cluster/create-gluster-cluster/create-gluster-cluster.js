(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createGlusterClusterController", createGlusterClusterController);

    /*@ngInject*/
    function createGlusterClusterController($rootScope, $scope, $uibModal, $filter, $state, $interval, utils, nodeStore, config, taskStore) {

        var vm = this,
            date = new Date(),
            initialLoad = true,
            journaTimer,
            journalJobId,
            counts = 0,
            nodes;

        vm.selectedStep = 1;
        vm.storageService = "Gluster";
        vm.totalDevices = 0;
        vm.glusterClusterName = "gluster_" + date.getFullYear() + date.getMonth() + date.getDate() + date.getTime();
        vm.wizardSteps = [{
            "number": 1,
            "name": "General"
        }, {
            "number": 2,
            "name": "Network & Hosts"
        }, {
            "number": 3,
            "name": "Review"
        }];

        vm.showSelectionWarning = false;
        vm.taskSubmitted = false;
        vm.isNodeLoading = true;
        vm.hostFilterBy = {
            "property": "fqdn",
            "value": ""
        };

        vm.clusterNetwork = [];
        vm.selectedNWHost = [];
        vm.selectedRoleHost = [];

        vm.filterByCN = filterByCN;
        vm.filterHostByCN = filterHostByCN;
        vm.selectNWHost = selectNWHost;
        vm.isSelectedNWHost = isSelectedNWHost;
        vm.validateFields = validateFields;
        vm.filterList = filterList;
        vm.nextStep = nextStep;
        vm.backStep = backStep;
        vm.getIfIpMapping = getIfIpMapping;
        vm.viewTaskProgress = viewTaskProgress;
        vm.getCNIfIp = getCNIfIp;

        init();

        function init() {
            vm.totalDevices = 0
            vm.availableHostList = [];
            vm.updatedHostList = [];
            vm.serverNodes = [];

            utils.getObjectList("Node").then(function(list) {
                var hostList = list.nodes,
                    len = hostList.length,
                    i;

                vm.isNodeLoading = false;
                nodes = hostList.slice(0);

                if (list !== null && len !== 0) {
                    for (i = 0; i < len; i++) {
                        if (JSON.parse(hostList[i].tags).indexOf("tendrl/central-store") !== -1) {
                            vm.serverNodes.push(hostList[i]);
                        } else if (!hostList[i].detectedcluster || (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === "")) {
                            //pushing available host for creating cluster
                            if (hostList[i].networks && hostList[i].localstorage) {
                                vm.availableHostList.push(hostList[i]);
                                changeIntoArray(hostList[i]);
                                _createHostList(hostList[i]);
                                vm.filteredList = vm.filterListByCN = $filter("filter")(vm.updatedHostList, vm.filterByCN);
                            }
                        }
                    }
                }
            });
        }

        function getIfIpMapping(ifIPMapping) {
            var len = ifIPMapping.length,
                i,
                res = [];

            for (i = 0; i < len; i++) {
                if (ifIPMapping[i].subnet === vm.selectedClusterNetwork) {
                    res.push(ifIPMapping[i]);
                }
            }

            return res;
        }

        function validateFields() {
            var flag = false,
                monFlag = false;

            vm.showSelectionWarning = false;
            vm.showMonSelectionWarning = false;

            if (vm.selectedStep === 2) {

                flag = vm.selectedNWHost.length < 4;
                //flag = vm.selectedNWHost.length < 1;

                if (flag) {
                    vm.hostSelectionMsg = "Minimum 4 hosts should be selected";
                    vm.showSelectionWarning = true;
                }

                return flag;
            }
        }

        function selectNWHost(host) {

            var hostIndex;

            if (typeof host === "boolean") {

                if (host) {
                    vm.selectedNWHost = vm.filteredList.slice(0);
                } else {
                    vm.selectedNWHost = [];
                }

            } else if (typeof host === "object") {
                hostIndex = vm.selectedNWHost.indexOf(host);

                if (hostIndex === -1) {
                    vm.selectedNWHost.push(host);
                } else {
                    vm.selectedNWHost.splice(hostIndex, 1);
                }
            }

            _calculateSummaryValues();
            vm.allNWHostChecked = vm.selectedNWHost.length === vm.filteredList.length;
        }

        function isSelectedNWHost(host) {
            return vm.selectedNWHost.indexOf(host) > -1;
        }

        function filterByCN(host) {
            if (host.subnets.indexOf(vm.selectedClusterNetwork) !== -1) {
                return host;
            }
        }

        function filterHostByCN() {
            vm.filteredList = $filter("filter")(vm.updatedHostList, vm.filterByCN);
        }

        function _getDisks(host) {
            var keys = Object.keys(host.localstorage.blockdevices.free),
                len = keys.length,
                disks = host.localstorage.blockdevices.free,
                temp,
                conf = [],
                i,
                disk;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.device = disks[keys[i]].device_name;
                temp.size = parseInt(disks[keys[i]].size) || 0;
                temp.ssd = (disks[keys[i]].ssd === "True");
                conf.push(temp);
            }
            return conf;
        }

        function _getACapacity(host) {
            var keys = Object.keys(host.localstorage.blockdevices.free),
                len = keys.length,
                disks = host.localstorage.blockdevices.free,
                size = 0,
                i,
                disk;

            for (i = 0; i < len; i++) {
                size += parseInt(disks[keys[i]].size);
            }

            return size;
        }

        function _createHostList(host) {
            var interfaceKeys = Object.keys(host.networks),
                len = interfaceKeys.length,
                interfaces = [],
                hostIP = [],
                subnets = [],
                ipLen,
                ip,
                i,
                j,
                obj = {},
                temp;

            obj.fqdn = host.fqdn;
            obj.node_id = host.node_id;
            obj.ifLength = len;
            obj.ifIPMapping = [];
            obj.subnets = [];

            if (!host.localstorage.blockdevices) {
                obj.freeDevices = 0;
                obj.usedDevices = 0;
                obj.totalNodeInDevice = 0;
                obj.storage_disks = [];
                obj.availableCapacity = 0;
            } else {
                obj.freeDevices = host.localstorage.blockdevices.free ? Object.keys(host.localstorage.blockdevices.free).length : 0;
                obj.usedDevices = host.localstorage.blockdevices.used ? Object.keys(host.localstorage.blockdevices.used).length : 0;
                obj.totalNodeInDevice = obj.freeDevices + obj.usedDevices;
                obj.storage_disks = _getDisks(host);
                obj.availableCapacity = host.localstorage.blockdevices.free ? _getACapacity(host) : 0;
            }

            //preparing interface and ip mapping, subnets
            for (i = 0; i < len; i++) {
                temp = {};

                ip = host.networks[interfaceKeys[i]].ipv4;
                ipLen = ip.length;

                for (j = 0; j < ipLen; j++) {
                    temp.if = interfaceKeys[i];
                    temp.ip = ip[j];
                    temp.subnet = host.networks[interfaceKeys[i]].subnet;
                    obj.ifIPMapping.push(temp);
                }

                if (obj.subnets.indexOf(host.networks[interfaceKeys[i]].subnet) === -1) {
                    obj.subnets.push(host.networks[interfaceKeys[i]].subnet);
                    _createClusterNetwork(host.networks[interfaceKeys[i]].subnet);
                }

                vm.selectedClusterNetwork = vm.clusterNetwork[0];
            }
            vm.updatedHostList.push(obj);

        }

        function _createClusterNetwork(subnet) {
            if (vm.clusterNetwork.indexOf(subnet) === -1) {
                vm.clusterNetwork.push(subnet);
            }
        }

        function changeIntoArray(host) {
            var i,
                interfaces = Object.keys(host.networks),
                len = interfaces.length;

            for (i = 0; i < len; i++) {
                host.networks[interfaces[i]].ipv4 = JSON.parse(host.networks[interfaces[i]].ipv4);
            }
        }

        function filterList(item) {
            var properties,
                property,
                i,
                diskLen,
                disks,
                searchBy = {},
                eth,
                ethlen,
                list = item.ifIPMapping,
                len = list.length;

            if (vm.hostFilterBy.value) {

                properties = vm.hostFilterBy.property.split(".");

                if (properties.length > 1) {
                    property = properties[1];

                    for (i = 0; i < len; i++) {
                        if (list[i][property].toLowerCase().indexOf(vm.hostFilterBy.value.toLowerCase()) >= 0) {
                            item.isExpanded = true;
                            return item;
                        }
                    }

                } else {
                    property = vm.hostFilterBy.property;

                    if (item[property].toLowerCase().indexOf(vm.hostFilterBy.value.toLowerCase()) >= 0) {
                        return item;
                    }
                }

            } else {
                return item;
            }
        }

        function _createClusterPostData() {
            var postData = {
                    "sds_name": "gluster"
                },
                sds_parameters = {},
                node_configuration = {},
                role = {
                    "Monitor": "ceph/mon",
                    "OSD Host": "osd"
                },
                network,
                len = vm.summaryHost.length,
                ipIfLen,
                i,
                j;

            sds_parameters.name = vm.glusterClusterName;
            sds_parameters.cluster_network = vm.selectedClusterNetwork;
            postData.sds_parameters = sds_parameters;
            postData.node_identifier = "ip";

            for (i = 0; i < len; i++) {
                ipIfLen = vm.summaryHost[i].ifIPMapping.length;

                for (j = 0; j < ipIfLen; j++) {
                    network = vm.getCNIfIp(vm.summaryHost[i]).ip;
                    node_configuration[network] = {};
                    node_configuration[network].role = "glusterfs/node";
                    node_configuration[network].provisioning_ip = network;
                }
            }
            postData.node_configuration = node_configuration;
            return postData;
        }

        function viewTaskProgress() {
            $state.go("task-detail", { taskId: vm.jobId });
        }

        function nextStep(step) {
            var postData,
                equal = false;

            if (!vm.showMsg) {
                vm.selectedStep += 1;

                if (vm.selectedStep === 2) {
                    _calculateSummaryValues();
                } else if (vm.selectedStep === 3) {
                    vm.summaryHost = JSON.parse(JSON.stringify(vm.selectedNWHost));
                } else if (vm.selectedStep === 4) {
                    postData = _createClusterPostData();
                    utils.createCluster(postData)
                        .then(function(data) {
                            vm.jobId = data.job_id;
                            vm.taskSubmitted = true;
                        });
                }
            }
        }

        function backStep(step) {
            vm.selectedStep--;
        }

        function getCNIfIp(host) {
            var len = host.ifIPMapping.length,
                i;

            for (i = 0; i < len; i++) {
                if (host.ifIPMapping[i].subnet === vm.selectedClusterNetwork) {
                    return host.ifIPMapping[i];
                }
            }
        }

        function _calculateSummaryValues() {
            var len = vm.selectedNWHost.length,
                i;

            vm.totalDevices = 0;
            vm.totalAvailableCapacity = 0;

            for (i = 0; i < len; i++) {
                vm.totalDevices += vm.selectedNWHost[i].freeDevices;
                vm.totalAvailableCapacity += vm.selectedNWHost[i].availableCapacity;
            }
        }

    }
})();
