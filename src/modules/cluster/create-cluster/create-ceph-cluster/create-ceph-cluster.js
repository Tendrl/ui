(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createCephClusterController", createCephClusterController);

    /*@ngInject*/
    function createCephClusterController($rootScope, $scope, $uibModal, $filter, utils, $state) {

        var vm = this,
            date = new Date();


        vm.selectedStep = 1;
        vm.storageService ="Ceph";
        vm.roles = ["Monitor", "OSD Host"];
        vm.totalDevices = 0;
        // vm.diskConf = {
        //     diskUnits: ['GB','MB'],
        //     journalConfigrationType: ["Colocated","Dedicated"],
        //     partitionType: ["SSD", "NVMe"],
        //     partitionValue: partitionValue
        // };
        vm.cephClusterName = "ceph_"+ date.getFullYear() + date.getMonth() + date.getDate() + date.getTime();
        vm.wizardSteps = [{
                "number": 1,
                "name": "General"
            },{
                "number": 2,
                "name": "Network & Host"
            },{
                "number": 3,
                "name": "Roles"
            },{
                "number": 4,
                "name": "Journal Configuration"
            },{
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

        vm.clusterNetwork = [];
        vm.publicNetwork = [];
        vm.filteredList = [];
        vm.selectedNWHost = [];
        vm.selectedRoleHost = [];

        vm.deviceWarningMsg = "Some devices contain user data and will be repartitioned on cluster creation. Any existing data will be lost."
        vm.createPublicNetwork = createPublicNetwork;
        vm.filterByCN = filterByCN;
        vm.filterByPN = filterByPN;
        vm.filterHostByPN = filterHostByPN;
        vm.selectNWHost = selectNWHost;
        vm.isSelectedNWHost = isSelectedNWHost;
        vm.validateFields = validateFields;
        vm.updateOSDMonCount = updateOSDMonCount;

        init();
        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            init();
        });

        function init() {
            vm.isDataLoading = true;
            vm.totalDevices = 0
            vm.availableHostList = [];
            vm.updatedHostList = [];
            vm.subnetList = [];

            utils.getObjectList("Node").then(function(list) {
                vm.isDataLoading = false;
                var hostList = list.nodes,
                    len = hostList.length;
                
                if(list !== null && len !== 0) {
                    for(var i = 0; i < len ; i++){
                        if (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === ""){
                            vm.availableHostList.push(hostList[i]);
                            //vm.totalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
                            changeIntoArray(hostList[i]);
                            _createHostList(hostList[i]);
                            vm.createPublicNetwork();
                        }
                    }
                }

                if(vm.availableHostList && vm.availableHostList.length >= 3) {
                    vm.enablePOCIntendedUsage = true;
                    vm.enableProIntendedUsage = true;
                    vm.intendedUsage = "production";
                } else if(vm.availableHostList && vm.availableHostList.length >= 1) {
                    vm.enablePOCIntendedUsage = true;
                    vm.enableProIntendedUsage = false;
                    vm.intendedUsage = "poc";  
                }
                
            });
        }

        function validateFields() {
            var flag = false,
                monFlag = false;
            vm.showSelectionWarning = false;
            vm.showMonSelectionWarning = false;

            if(vm.selectedStep === 2) {
                
                if(vm.intendedUsage === "production") {                
                    flag = vm.selectedNWHost.length < 3;
                    
                    if(flag) {
                        vm.hostSelectionMsg = "Minimum 3 hosts should be selected for Production";
                        vm.showSelectionWarning = true;
                    }
                } else if(vm.intendedUsage === "poc") {
                    flag = vm.selectedNWHost.length < 1;
                    
                    if(flag) {
                        vm.hostSelectionMsg = "Minimum 1 host should be selected for POC";
                        vm.showSelectionWarning = true;
                    }
                }

                return flag; 
            } else if(vm.selectedStep === 3) {

                if(vm.intendedUsage === "production") {                
                    monFlag = vm.selectedMonitors < 3;
                    
                    if(monFlag) {
                        vm.monSelectionMsg = "Minimum 3 monitors should be selected for Production";
                        vm.showMonSelectionWarning = true;
                    }
                } else if(vm.intendedUsage === "poc") {
                    monFlag = vm.selectedMonitors < 1;
                    
                    if(monFlag) {
                        vm.monSelectionMsg = "Minimum 1 monitor should be selected for POC";
                        vm.showMonSelectionWarning = true;
                    }
                }

                return monFlag;   
            }
        }

        function selectNWHost(host) {
            
            var hostIndex;

            if (typeof host === "boolean") {
                
                if(host) {
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

            console.log(vm.selectedNWHost, "selectedNWHost");

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

            for ( i = 0; i < len; i++) {
                subnetLen = vm.filteredList[i].subnets.length;

                for ( j = 0; j < subnetLen; j++) {
                    if(vm.publicNetwork.indexOf(vm.filteredList[i].subnets[j]) === -1) {
                        vm.publicNetwork.push(vm.filteredList[i].subnets[j]);
                    }
                }
            }

            vm.selectedPublicNetwork = vm.publicNetwork[0];
            vm.filteredList = vm.filteredListByPN = $filter("filter")(vm.filterListByCN, vm.filterByPN);
        };

        function filterByCN(host) {
            if(host.subnets.indexOf(vm.selectedClusterNetwork) !== -1) {
                return host;
            }
        }

        function filterByPN(host) {
            if(host.subnets.indexOf(vm.selectedPublicNetwork) !== -1) {
                return host;
            }
        }

        function filterHostByPN() {
            vm.filteredList = $filter("filter")(vm.filterListByCN, vm.filterByPN);   
        }

        function _getDisks(host) {
            var keys = Object.keys(host.disks),
                len = keys.length,
                temp,
                conf = [],
                i;

            for ( i = 0; i < len; i++) {
                if(keys[i] !== "free" && keys[i] !== "used") {
                    temp = {};
                    temp.device = host.disks[keys[i]].device_name;
                    temp.size = host.disks[keys[i]].size;
                    temp.ssd = host.disks[keys[i]].ssd;
                    conf.push(temp);
                }
            }

            return conf;
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
            obj.interfaces = [];
            obj.ifLength = len;
            obj.ifIPMapping =[];
            obj.hostIP = [];
            obj.subnets = [];
            obj.freeDevices = host.disks.free ? Object.keys(host.disks.free).length : 0;
            obj.usedDevices = host.disks.used ? Object.keys(host.disks.used).length : 0;
            obj.totalNodeInDevice = obj.freeDevices + obj.usedDevices;
            obj.selectedRole = _getRole(obj);
            obj.storage_disks = _getDisks(host);

            for ( i = 0; i < len; i++) {
                temp = {};
                
                ip = host.networks[interfaceKeys[i]].ipv4;
                ipLen = ip.length;

                for ( j = 0; j < ipLen; j++) {
                    temp.if = interfaceKeys[i];
                    temp.ip = ip[j];
                    obj.ifIPMapping.push(temp);
                }

                if(obj.subnets.indexOf(host.networks[interfaceKeys[i]].subnet) === -1) {
                    obj.subnets.push(host.networks[interfaceKeys[i]].subnet);
                    _createClusterNetwork(host.networks[interfaceKeys[i]].subnet);
                }

                obj.selectedHostIP = obj.hostIP[0];
                obj.selectedInterface = obj.interfaces[0];
                vm.selectedClusterNetwork = vm.clusterNetwork[0];
            }
            vm.updatedHostList.push(obj);

            console.log(vm.updatedHostList, "updatedHostList");
        }

        function _createClusterNetwork(subnet) {
            if(vm.clusterNetwork.indexOf(subnet) === -1) {
                vm.clusterNetwork.push(subnet);
            }
        }

        function updateOSDMonCount() {
            var len = vm.availableHostForRole.length,
                i;

            vm.selectedMonitors = 0;
            vm.selectedOSDs = 0;

            for (i = 0; i < len; i++) {

                if(vm.availableHostForRole[i].selectedRole === "Monitor") {
                    vm.selectedMonitors += 1;
                } else if(vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    vm.selectedOSDs += 1;
                }
            }
        }

        function changeIntoArray(host){
            var i,
                interfaces = Object.keys(host.networks),
                len = interfaces.length;

            for ( i = 0; i < len; i++) {
                host.networks[interfaces[i]].ipv4 = JSON.parse(host.networks[interfaces[i]].ipv4);
            }
        }

        function _getRole(host) {
            if(host.totalNodeInDevice >= 1) {
                return "OSD Host";
            } else {
                return "Monitor";
            }
        }

        vm.selectedNodes = function(){
            vm.selectedNodeList = []
            for(var index=0; index< vm.availableHostForRole.length; index++){
                if(vm.availableHostList[index].checkboxSelected && vm.availableHostList[index].selectedRole){
                    vm.selectedNodeList.push(vm.availableHostList[index]);
                    vm.selectedNodeList[index].customselectedUnit = "GB";
                    vm.selectedNodeList[index].selectedJournalConfigration = "Colocated";
                    vm.selectedNodeList[index].partitionSize = 4;
                    vm.selectedNodeList[index].selectedPartitionType = "SSD";
                    // vm.selectedNodeList.selectedTotalDevices += hostList[i].disks ? hostList[i].disks.devices.length : 0;
                    // vm.selectedNodeList.selectedTotalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
                    vm.selectedNodeList[index].checkboxSelected = vm.availableHostList[index].checkboxSelected;
                    vm.selectedNodeList[index].selectedRole = vm.availableHostList[index].selectedRole;
                    vm.selectedNodeList[index].totalNodeInDevice = vm.availableHostList[index].totalNodeInDevice;
                    selectedNetworks(vm.selectedNodeList[index].networks.eth0);
                }
            }
            return vm.selectedNodeList;
        };

        function createClusterPostData(){
            var postData = {},
            sds_parameters = {},
            node_configuration = {},
            conf_overrides =  {
            "global":{
                "osd_pool_default_pg_num":128,
                "pool_default_pgp_num":1
                }
            },
            role = {
                "Monitor": "ceph/mon",
                "OSD Host": "osd"
            }

            sds_parameters.name = vm.cephClusterName;
            sds_parameters.public_network = vm.subnet;
            sds_parameters.cluster_network = vm.subnet;
            sds_parameters.conf_overrides = conf_overrides;
            postData.sds_parameters = sds_parameters;
            postData.node_identifier = "ip";

            for(var index = 0; index < vm.selectedNodes.length; index++){
                var network = vm.selectedNodes[index].networks.eth0;
                for(var index1=0; index1<network.ipv4.length; index1++){
                    ip = network.ipv4[index1];
                    ip.provisioning_ip = ip;
                    ip.monitor_interface = network.interface;
                    ip.role = role[vm.selectedRole[0]];
                    node_configuration.push(ip)
                }
            }
            postData.node_configuration = node_configuration;
            console.log(postData);
        }

        function _createNodeConf() {
            var len = vm.availableHostForRole.length,
                i;

            vm.nodeConf = {
                node_configuration: []
            };

            if(vm.intendedUsage === "production") {
                for ( i = 0; i < len; i++) {
                    vm.nodeConf.node_configuration
                }
            }
        }

        vm.nextStep = function(step) {
            if(!vm.showMsg){
                vm.selectedStep += 1;
                
                if(vm.selectedStep === 3) {
                    console.log(vm.selectedNWHost, "selectedNWHost");
                    vm.availableHostForRole = vm.selectedNWHost;
                    console.log(vm.availableHostForRole, "lll");
                    _calculateSummaryValues();
                }else if(vm.selectedStep === 4) {
                    //_createNodeConf();
                    utils.getJournalConf()
                        .then(function(data) {
                            
                        });
                }else if(vm.selectedStep === 5) {
                    createClusterPostData();
                }
                
            }

        };

        vm.backStep= function(step) {
            vm.selectedStep -= 1;

            if(vm.selectedStep >= 3) {
                closeExpandList();
            }

        };

        function _calculateSummaryValues() {
            var len = vm.availableHostForRole.length,
                i;

            vm.totalDevices = 0;
            vm.selectedMonitors = 0;
            vm.selectedOSDs = 0;

            for (i = 0; i < len; i++) {
                vm.totalDevices += vm.availableHostForRole[i].totalNodeInDevice;
                
                if(vm.availableHostForRole[i].selectedRole === "Monitor") {
                    vm.selectedMonitors += 1;
                } else if(vm.availableHostForRole[i].selectedRole === "OSD Host") {
                    vm.selectedOSDs += 1;
                }
            }
        }

        
    }
})();