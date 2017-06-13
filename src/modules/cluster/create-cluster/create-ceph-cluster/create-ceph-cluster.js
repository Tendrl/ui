(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createCephClusterController", createCephClusterController);

    /*@ngInject*/
    function createCephClusterController($rootScope, $scope, $uibModal, $filter, $state, $interval, utils, nodeStore, config, taskStore, clusterStore) {

        var vm = this,
            date = new Date(),
            initialLoad = true,
            journaTimer,
            journalJobId,
            counts = 0,
            nodes;

        vm.selectedStep = 1;
        vm.storageService = "Ceph";
        vm.roles = ["Monitor", "OSD Host"];
        vm.totalDevices = 0;
        vm.diskConf = {
            diskUnits: ['GB', 'MB'],
            journalConfigrationType: ["Colocated", "Dedicated"],
            partitionType: ["SSD", "HDD"],
            partitionValue: 4
        };
        vm.cephClusterName = "ceph_" + date.getFullYear() + date.getMonth() + date.getDate() + date.getTime();
        vm.wizardSteps = [{
            "number": 1,
            "name": "General"
        }, {
            "number": 2,
            "name": "Network & Hosts"
        }, {
            "number": 3,
            "name": "Roles"
        }, {
            "number": 4,
            "name": "Journal Configuration"
        }, {
            "number": 5,
            "name": "Review"
        }];

        vm.diskFilterBy = {
            "property": "fqdn",
            "value": ""
        };

        vm.subnetFilterBy = {
            "property": "networks.eth0.subnet",
            "value": ""
        };
        vm.showSelectionWarning = false;
        vm.showMonSelectionWarning = false;
        vm.taskSubmitted = false;
        vm.journalFilterBy = "fqdn";
        vm.isNodeLoading = true;
        vm.showJournalErrorMsg = false;
        vm.journalErrorMsg = "";

        vm.clusterNetwork = [];
        vm.publicNetwork = [];
        vm.filteredList = [];
        vm.selectedNWHost = [];
        vm.selectedRoleHost = [];
        vm.journalFilterBy = {
            "property": "fqdn",
            "value": ""
        };

        vm.createPublicNetwork = createPublicNetwork;
        vm.filterByCN = filterByCN;
        vm.filterByPN = filterByPN;
        vm.filterHostByPN = filterHostByPN;
        vm.selectNWHost = selectNWHost;
        vm.isSelectedNWHost = isSelectedNWHost;
        vm.validateFields = validateFields;
        vm.updateOSDMonCount = updateOSDMonCount;
        vm.closeExpandList = closeExpandList;
        vm.expandList = expandList;
        vm.reset = reset;
        vm.filterByOSD = filterByOSD;
        vm.filterList = filterList;
        vm.getJournalMap = getJournalMap;
        vm.nextStep = nextStep;
        vm.backStep = backStep;
        vm.getIfIpMapping = getIfIpMapping;
        vm.getCNIfIp = getCNIfIp;
        vm.viewTaskProgress = viewTaskProgress;
        vm.changePartitionLimit = changePartitionLimit;

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
                            vm.availableHostList.push(hostList[i]);
                            changeIntoArray(hostList[i]);
                            _createHostList(hostList[i]);
                            vm.createPublicNetwork();
                        }
                    }
                }

                if (initialLoad) {
                    _setIntendedUsage();
                }
            });
        }

        function changePartitionLimit(host) {
            _updatePartionSize(host);
        }

        function getIfIpMapping(ifIPMapping, type) {
            var len = ifIPMapping.length,
                i,
                res = [];

            if (type === "cn") {
                res = [];
                for (i = 0; i < len; i++) {
                    if (ifIPMapping[i].subnet === vm.selectedClusterNetwork) {
                        res.push(ifIPMapping[i]);
                    }
                }
            } else if (type === "pn") {
                res = [];
                for (i = 0; i < len; i++) {
                    if (ifIPMapping[i].subnet === vm.selectedPublicNetwork) {
                        res.push(ifIPMapping[i]);
                    }
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

                if (vm.intendedUsage === "production") {
                    flag = vm.selectedNWHost.length < 3;

                    if (flag) {
                        vm.hostSelectionMsg = "Minimum 3 hosts should be selected for Production";
                        vm.showSelectionWarning = true;
                    }
                } else if (vm.intendedUsage === "poc") {
                    flag = vm.selectedNWHost.length < 1;

                    if (flag) {
                        vm.hostSelectionMsg = "Minimum 1 host should be selected for POC";
                        vm.showSelectionWarning = true;
                    }
                }

                return flag;
            } else if (vm.selectedStep === 3) {

                if (vm.intendedUsage === "production") {
                    monFlag = vm.selectedMonitors < 3;
                    //monFlag = vm.selectedMonitors < 1;

                    if (monFlag) {
                        vm.monSelectionMsg = "Minimum 3 monitors should be selected for Production";
                        vm.showMonSelectionWarning = true;
                    }
                } else if (vm.intendedUsage === "poc") {
                    monFlag = vm.selectedMonitors < 1;

                    if (monFlag) {
                        vm.monSelectionMsg = "Minimum 1 monitor should be selected for POC";
                        vm.showMonSelectionWarning = true;
                    }
                }
                return monFlag;
            } else if (vm.selectedStep === 4) {
                return vm.isDataLoading;
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

            vm.allNWHostChecked = vm.selectedNWHost.length === vm.filteredList.length;
        }

        function isSelectedNWHost(host) {
            return vm.selectedNWHost.indexOf(host) > -1;
        }

        function createPublicNetwork() {
            var len,
                subnetLen,
                i,
                j;

            vm.publicNetwork = [];
            vm.filteredList = vm.filterListByCN = $filter("filter")(vm.updatedHostList, vm.filterByCN);
            len = vm.filteredList.length

            for (i = 0; i < len; i++) {
                subnetLen = vm.filteredList[i].subnets.length;

                for (j = 0; j < subnetLen; j++) {
                    if (vm.publicNetwork.indexOf(vm.filteredList[i].subnets[j]) === -1) {
                        vm.publicNetwork.push(vm.filteredList[i].subnets[j]);
                    }
                }
            }

            vm.selectedPublicNetwork = vm.publicNetwork[0];
            vm.filteredList = vm.filteredListByPN = $filter("filter")(vm.filterListByCN, vm.filterByPN);
        };

        function filterByCN(host) {
            if (host.subnets.indexOf(vm.selectedClusterNetwork) !== -1) {
                return host;
            }
        }

        function filterByPN(host) {
            if (host.subnets.indexOf(vm.selectedPublicNetwork) !== -1) {
                return host;
            }
        }

        function filterHostByPN() {
            vm.filteredList = $filter("filter")(vm.filterListByCN, vm.filterByPN);
        }

        function reset() {
            vm.selectedNWHost = [];
            vm.availableHostForRole = [];
            vm.filteredList = [];
            vm.availableHostForJournal = [];
            vm.summaryHost = [];
            vm.availableHostList = [];
            vm.serverNodes = [];
            var list = nodes.slice(0);
            vm.clusterNetwork = [];
            vm.publicNetwork = [];
            vm.filterListByCN = [];
            vm.filteredListByPN = [];
            vm.selectedClusterNetwork = "";
            vm.updatedHostList = [];
            vm.totalDevices = 0;
            _getHostList(list);
        }

        function updateOSDMonCount() {
            var len = vm.availableHostForRole.length,
                i;

            vm.selectedMonitors = 0;
            vm.selectedOSDs = 0;

            for (i = 0; i < len; i++) {

                if (vm.availableHostForRole[i].selectedRole === "Monitor") {
                    vm.selectedMonitors += 1;
                } else if (vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    vm.selectedOSDs += 1;
                }
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

        function getCNIfIp(host) {
            var len = host.ifIPMapping.length,
                i;

            for (i = 0; i < len; i++) {
                if (host.ifIPMapping[i].subnet === vm.selectedClusterNetwork) {
                    return host.ifIPMapping[i];
                }
            }
        }

        function filterByOSD(host) {
            if (host.selectedRole !== "Monitor") {
                return host;
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
                list = item.storage_disks,
                len = list.length;

            if (vm.journalFilterBy.value) {

                properties = vm.journalFilterBy.property.split(".");

                if (properties.length > 1) {
                    property = properties[1];

                    for (i = 0; i < len; i++) {
                        if (list[i][property].toLowerCase().indexOf(vm.journalFilterBy.value.toLowerCase()) >= 0) {
                            item.isExpanded = true;
                            return item;
                        }
                    }

                } else {
                    property = vm.journalFilterBy.property;

                    if (item[property].toLowerCase().indexOf(vm.journalFilterBy.value.toLowerCase()) >= 0) {
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

        function getJournalMap(host, $event) {
            _resetNodeDetails(host);
            vm.showJournalErrorMsg = false;
            if (host.selectedJournalConfigration === "Dedicated") {
                //host.isDataLoading = true;
                vm.isDataLoading = true;
                nodeStore.generateJournalConf(host)
                    .then(function(data) {
                        host.journalJobId = data.job_id;
                        host.counts = 0;
                        _startJournalTimer(host.journalJobId, "singleHost", host);
                    });
            }

        }

        function nextStep(step) {
            var postData,
                equal = false;

            if (!vm.showMsg) {
                vm.selectedStep += 1;

                if (vm.selectedStep === 3) {
                    vm.availableHostForRole = vm.selectedNWHost.slice(0);
                    _calculateSummaryValues();
                } else if (vm.selectedStep === 4) {
                    vm.isDataLoading = true;
                    vm.showJournalErrorMsg = false;
                    if (!_isOSDPresent()) {
                        vm.selectedStep++;
                        if (vm.availableHostForJournal) {
                            vm.summaryHost = vm.availableHostForJournal.slice(0);
                        } else {
                            vm.summaryHost = vm.availableHostForRole.slice(0);
                        }
                        _resetExpandProp(vm.summaryHost);
                    } else {
                        vm.availableHostForJournal = JSON.parse(JSON.stringify(vm.availableHostForRole));
                        _setJournalConf();
                        if (vm.intendedUsage === "production") {
                            nodeStore.generateJournalConf(vm.availableHostForRole)
                                .then(function(data) {
                                    journalJobId = data.job_id;
                                    counts = 0;
                                    _startJournalTimer(journalJobId);
                                });
                        } else {
                            vm.isDataLoading = false;
                        }
                    }
                } else if (vm.selectedStep === 5) {
                    if (vm.availableHostForJournal) {
                        vm.summaryHost = vm.availableHostForJournal.slice(0);
                    } else {
                        vm.summaryHost = vm.availableHostForRole.slice(0);
                    }
                    _resetExpandProp(vm.summaryHost);
                } else if (vm.selectedStep === 6) {
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

            if (vm.selectedStep === 4) {
                if (!_isOSDPresent()) {
                    vm.selectedStep--;
                } else {
                    _resetExpandProp(vm.availableHostForJournal);
                }
            }
        }

        function closeExpandList() {
            var len = vm.availableHostForRole.length,
                i;

            for (i = 0; i < len; i++) {
                vm.availableHostForRole[i].isExpanded = false;
            }
        }

        function expandList(item) {
            if (item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
        }

        /*------Private Functions ------------------------------------------------------*/

        function _getHostList(list) {
            var hostList = list,
                len = hostList.length,
                i;

            vm.isNodeLoading = false;

            if (list !== null && len !== 0) {
                for (i = 0; i < len; i++) {
                    if (JSON.parse(hostList[i].tags).indexOf("tendrl/central-store") !== -1) {
                        vm.serverNodes.push(hostList[i]);
                    } else if (!hostList[i].detectedcluster || (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === "")) {
                        //pushing available host for creating cluster
                        vm.availableHostList.push(hostList[i]);
                        _createHostList(hostList[i]);
                        vm.createPublicNetwork();
                    }
                }
            }
        }

        function _setIntendedUsage() {
            if (vm.availableHostList && vm.availableHostList.length >= 3) {
                vm.enablePOCIntendedUsage = true;
                vm.enableProIntendedUsage = true;
                vm.intendedUsage = "production";
            } else if (vm.availableHostList && vm.availableHostList.length >= 1) {
                vm.enablePOCIntendedUsage = true;
                vm.enableProIntendedUsage = false;
                vm.intendedUsage = "poc";
            }
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
                temp.ssd = ((disks[keys[i]].ssd).toLowerCase() === "true");
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
                obj.selectedRole = _getRole(obj);
                obj.storage_disks = [];
                obj.availableCapacity = 0;
            } else {
                obj.freeDevices = host.localstorage.blockdevices.free ? Object.keys(host.localstorage.blockdevices.free).length : 0;
                obj.usedDevices = host.localstorage.blockdevices.used ? Object.keys(host.localstorage.blockdevices.used).length : 0;
                obj.totalNodeInDevice = obj.freeDevices + obj.usedDevices;
                obj.selectedRole = _getRole(obj);
                obj.storage_disks = _getDisks(host);
                obj.availableCapacity = host.localstorage.blockdevices.free ? _getACapacity(host) : 0;
                obj.disks = host.disks;
                obj.localstorage = {};
                obj.localstorage.blockdevices = host.localstorage.blockdevices;
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

        function _addSubToIfIpMapping(obj) {
            var len = obj.ifIPMapping.length,
                i;

            for (i = 0; i < len; i++) {
                obj.ifIPMapping[i].subnets = obj.subnets;
            }
        }

        function _createClusterNetwork(subnet) {
            if (vm.clusterNetwork.indexOf(subnet) === -1) {
                vm.clusterNetwork.push(subnet);
            }
        }

        function _getRole(host) {
            var role = "";

            if (host.freeDevices >= 1) {
                role = "OSD Host";
                host.disableSelection = false;
            } else {
                role = "Monitor";
                host.disableSelection = true;
            }

            if (!host.totalNodeInDevice) {
                role = "Monitor";
                host.disableSelection = true;
            }

            return role;
        }

        function _createNodeConf() {
            var len = vm.availableHostForRole.length,
                i;

            vm.nodeConf = {
                node_configuration: []
            };

            if (vm.intendedUsage === "production") {
                for (i = 0; i < len; i++) {
                    vm.nodeConf.node_configuration
                }
            }
        }

        function _createJournalData(journals) {
            var len = journals.length,
                i;

            // if (vm.intendedUsage === "production" || vm.intendedUsage === "") {
            for (i = 0; i < len; i++) {
                _updateDiskList(journals[i]);
            }
            //}
        }

        function _setSmallestJournalSize(type, host) {
            var len = vm.availableHostForJournal.length,

                i;
            if (!type) {
                for (i = 0; i < len; i++) {
                    if (vm.availableHostForJournal[i].selectedRole === "OSD Host") {
                        vm.availableHostForJournal[i].journalSizeList.sort();
                        _updatePartionSize(vm.availableHostForJournal[i]);
                    }
                }
            } else {

                for (i = 0; i < len; i++) {
                    if (vm.availableHostForJournal[i].node_id === host.node_id) {
                        vm.availableHostForJournal[i].journalSizeList.sort();
                        _updatePartionSize(vm.availableHostForJournal[i]);
                    }
                }
            }

        }

        function _updatePartionSize(host) {
            var len = vm.availableHostForJournal.length,
                val,
                i;

            // for (i = 0; i < len; i++) {
            //     if (vm.availableHostForJournal[i].selectedRole === "OSD Host") {
            val = Math.floor(utils.convertToBytes(host.journalSizeList[0]) / utils.convertToBytes(host.journalSize, host.customselectedUnit || "GB"));
            if (val < 4) {
                host.partitionSize = val;
                host.reachedMaxLimit = true;
                host.maxLimit = val;
            } else {
                host.maxLimit = val;
                host.partitionSize = 4;
                host.reachedMaxLimit = false;
            }
            //}
            //}
        }

        //deleting journal disk from storage_disks
        function _deleteJournalDisks(journal, host) {
            var len = journal.storage_disks.length,
                hostDisklen = host.storage_disks.length,
                i,
                j,
                present;

            host.journalSizeList = [];

            for (i = 0; i < len; i++) {
                for (j = 0; j < hostDisklen; j++) {

                    if (host.storage_disks[j].device === journal.storage_disks[i].journal) {
                        host.journalSizeList.push(host.storage_disks[j].size);
                        host.storage_disks.splice(j, 1);
                        hostDisklen = host.storage_disks.length;
                    }
                }
            }
        }

        function _updateDiskList(journal) {
            var len = vm.availableHostForJournal.length,
                diskLen,
                i,
                j;

            for (i = 0; i < len; i++) {
                if (vm.availableHostForJournal[i].node_id === journal.node_id) {
                    vm.availableHostForJournal[i].journalSize = 5;
                    _deleteJournalDisks(journal, vm.availableHostForJournal[i]);
                    _upadateDisk(vm.availableHostForJournal[i], journal);
                    vm.availableHostForJournal[i].unallocated_disks = journal.unallocated_disks ? journal.unallocated_disks : [];

                    if (vm.availableHostForJournal[i].unallocated_disks.length) {
                        _deleteUnallocatedDisks(vm.availableHostForJournal[i], journal);
                    }
                    break;
                }
            }

        }

        function _deleteUnallocatedDisks(host, journal) {
            var journalLen = journal.unallocated_disks.length,
                hostLen = host.storage_disks.length,
                i,
                j;

            for (i = 0; i < journalLen; i++) {

                for (j = 0; j < hostLen; j++) {
                    if (journal.unallocated_disks[i] === host.storage_disks[j].device) {
                        host.storage_disks.splice(j, 1);
                        break;
                    }
                }
            }
        }

        function _upadateDisk(host, journal) {
            var journalLen = journal.storage_disks.length,
                hostLen = host.storage_disks.length,
                i,
                j;

            for (i = 0; i < journalLen; i++) {

                for (j = 0; j < hostLen; j++) {
                    if (journal.storage_disks[i].device === host.storage_disks[j].device) {
                        host.storage_disks[j].journal = journal.storage_disks[i].journal;
                        break;
                    }
                }
            }
        }

        function _setJournalConf() {
            var len = vm.availableHostForJournal.length,
                i;

            for (i = 0; i < len; i++) {
                if (vm.intendedUsage === "production") {
                    vm.availableHostForJournal[i].selectedJournalConfigration = "Dedicated";
                } else if (vm.intendedUsage === "poc") {
                    vm.availableHostForJournal[i].selectedJournalConfigration = "Colocated";
                }
            }
        }

        function _resetNodeDetails(host) {
            var len = vm.availableHostForJournal.length,
                journal = "",
                i;

            for (i = 0; i < len; i++) {
                if (host.node_id === vm.availableHostForRole[i].node_id) {
                    if (host.selectedJournalConfigration === "Colocated") {
                        journal = "Colocated";
                    } else if (host.selectedJournalConfigration === "Dedicated") {
                        journal = "Dedicated";
                    }
                    vm.availableHostForJournal[i] = JSON.parse(JSON.stringify(vm.availableHostForRole[i]));
                    vm.availableHostForJournal[i].selectedJournalConfigration = journal;
                    vm.availableHostForJournal[i].journalSize = 5;
                    vm.availableHostForJournal[i].customselectedUnit = "GB";

                    if (journal === "Colocated") {
                        vm.availableHostForJournal[i].storage_disks = _getDisks(vm.availableHostForRole[i]);
                    }

                    break;
                }
            }
        }

        function _createClusterPostData() {
            var roleMapping = {
                    "Monitor": "ceph/mon",
                    "OSD Host": "ceph/osd"
                },
                postData = {
                    "sds_name": "ceph"
                },
                sds_parameters = {},
                node_configuration = {},
                conf_overrides = {
                    "global": {
                        "osd_pool_default_pg_num": 128,
                        "pool_default_pgp_num": 1
                    }
                },
                role = {
                    "Monitor": "ceph/mon",
                    "OSD Host": "osd"
                },
                network,
                len = vm.summaryHost.length,
                ipIfLen,
                i,
                j;

            sds_parameters.cluster_id = clusterStore.generateUUID();
            sds_parameters.name = vm.cephClusterName;
            sds_parameters.public_network = vm.selectedPublicNetwork;
            sds_parameters.cluster_network = vm.selectedClusterNetwork;
            sds_parameters.conf_overrides = conf_overrides;
            postData.sds_parameters = sds_parameters;
            postData.node_identifier = "ip";

            for (i = 0; i < len; i++) {
                ipIfLen = vm.summaryHost[i].ifIPMapping.length;

                for (j = 0; j < ipIfLen; j++) {
                    network = vm.getCNIfIp(vm.summaryHost[i]).ip;
                    node_configuration[network] = {};
                    node_configuration[network].role = roleMapping[vm.summaryHost[i].selectedRole];
                    node_configuration[network].provisioning_ip = network;
                    if (vm.summaryHost[i].selectedRole === "OSD Host") {
                        if (vm.summaryHost[i].customselectedUnit === "GB") {
                            node_configuration[network].journal_size = vm.summaryHost[i].journalSize * 1024;
                        } else {
                            node_configuration[network].journal_size = vm.summaryHost[i].journalSize;
                        }
                        node_configuration[network].journal_colocation = vm.summaryHost[i].selectedJournalConfigration === "Dedicated" ? false : true;
                        node_configuration[network].storage_disks = vm.summaryHost[i].storage_disks;
                    } else if (vm.summaryHost[i].selectedRole === "Monitor") {
                        node_configuration[network].monitor_interface = vm.summaryHost[i].ifIPMapping[j]["if"];
                    }
                }
            }
            postData.node_configuration = node_configuration;
            return postData;
        }

        function _resetExpandProp(list) {
            var len = list.length,
                i;

            for (i = 0; i < len; i++) {
                list[i].isExpanded = false;
            }
        }

        function _upadateAvailableHostForJournal() {
            var len = vm.availableHostForJournal.length,
                i;

            for (i = 0; i < len; i++) {
                if (!vm.availableHostForJournal[i].localstorage.blockdevices.free || Object.keys(vm.availableHostForJournal[i].localstorage.blockdevices.free).length) {
                    vm.availableHostForJournal.splice(i, 1);
                }
            }
        }

        function _setCollocatedJournal(type, host) {
            var len = vm.availableHostForJournal.length,
                i;
            if (type) {

                for (i = 0; i < len; i++) {
                    if (vm.availableHostForJournal[i].node_id === host.node_id) {
                        vm.availableHostForJournal[i].selectedJournalConfigration = "Colocated";
                        break;
                    }
                }
                //host.selectedJournalConfigration = "Colocated";
            } else {

                for (i = 0; i < len; i++) {
                    if (vm.availableHostForJournal[i].selectedRole === "OSD Host") {
                        vm.availableHostForJournal[i].selectedJournalConfigration = "Colocated";
                    }
                }
            }
        }

        function _startJournalTimer(journalJobId, type, host) {
            journaTimer = $interval(function() {

                utils.getTaskStatus(journalJobId)
                    .then(function(data) {
                        $interval.cancel(journaTimer);

                        if (data.status !== "finished") {
                            if (type === "singleHost") {
                                if (host.counts < 25 && data.status !== "failed") {
                                    _startJournalTimer(journalJobId, type, host);
                                    host.counts++;
                                } else {
                                    _setCollocatedJournal(type, host);
                                    vm.isDataLoading = false;
                                    vm.journalErrorMsg = "Not able to get the journal mapping of the OSD Node. Setting to Colocated journal."
                                    vm.showJournalErrorMsg = true;
                                }
                            } else {
                                if (counts < 25 && data.status !== "failed") {
                                    _startJournalTimer(journalJobId);
                                    counts++;
                                } else {
                                    _setCollocatedJournal();
                                    vm.isDataLoading = false;
                                    vm.journalErrorMsg = "Not able to get the journal mapping of all OSD Nodes. Setting to Colocated journal."
                                    vm.showJournalErrorMsg = true;
                                }
                            }
                        } else {
                            taskStore.getTaskOutput(journalJobId)
                                .then(function(data) {
                                    vm.showJournalErrorMsg = false;
                                    if (type === "singleHost") {
                                        //host.isDataLoading = false;
                                        vm.isDataLoading = false;
                                    } else {
                                        vm.isDataLoading = false;
                                    }
                                    _createJournalData(data);
                                    _setSmallestJournalSize(type, host);
                                });
                        }
                    });

            }, 1000 * config.statusRefreshIntervalTime, 1);
        }

        function _isOSDPresent() {
            var present = false,
                len = vm.availableHostForRole.length,
                i;

            for (i = 0; i < len; i++) {
                if (vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    present = true;
                    break;
                }
            }

            return present;
        }

        function _calculateSummaryValues() {
            var len = vm.availableHostForRole.length,
                i;

            vm.totalDevices = 0;
            vm.selectedMonitors = 0;
            vm.selectedOSDs = 0;
            vm.totalAvailableCapacity = 0;

            for (i = 0; i < len; i++) {
                vm.totalDevices += vm.availableHostForRole[i].totalNodeInDevice;

                if (vm.availableHostForRole[i].selectedRole === "Monitor") {
                    vm.selectedMonitors += 1;
                } else if (vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    vm.selectedOSDs += 1;
                }

                vm.totalAvailableCapacity += vm.availableHostForRole[i].availableCapacity;
            }
        }

    }
})();
