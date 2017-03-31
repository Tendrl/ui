(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createCephClusterController", createCephClusterController);

    /*@ngInject*/
    function createCephClusterController($rootScope, $scope, utils, $state, $uibModal) {

        var vm = this,
            date = new Date();


        vm.selectedStep = 1;
        vm.storageService ="Ceph";
        vm.roles = ["Monitor", "OSD Host"];
        vm.totalDevices = 0;
        vm.diskConf = {
            diskUnits: ['GB','MB'],
            journalConfigrationType: ["Colocated","Dedicated"],
            partitionType: ["SSD", "NVMe"],
            partitionValue: partitionValue
        };
        vm.cephClusterName = "ceph_"+ date.getFullYear() + date.getMonth() + date.getDate() + date.getTime();
        vm.wizardSteps = [{
                "number": 1,
                "name": "General"
            },{
                "number": 2,
                "name": "Hosts"
            },{
                "number": 3,
                "name": "Device Configration"
            },{
                "number": 4,
                "name": "Network"
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

        vm.refreshHostList = refreshHostList;
        vm.filterNestedList = filterNestedList;
        vm.filterList = filterList;
        vm.expandList = expandList;
        vm.changeSelectedNetwork = changeSelectedNetwork;
        vm.allCheckboxSelected =allCheckboxSelected;
        vm.deviceWarningMsg = "Some devices contain user data and will be repartitioned on cluster creation. Any existing data will be lost."

        init();
        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            init();
        });

        function init() {
            vm.isDataLoading = true;
            vm.totalDevices = 0
            vm.availableHostList = [];
            utils.getObjectList("Node").then(function(list) {
                vm.isDataLoading = false;
                var hostList = list.nodes;
                if(list !== null && hostList.length !== 0) {
                    for(var i = 0; i<hostList.length ; i++){
                        if (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === ""){
                            vm.availableHostList.push(hostList[i]);
                            vm.totalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
                            hostList[i].freeDevices = Object.keys(hostList[i].disks.free).length;
                            hostList[i].usedDevices = Object.keys(hostList[i].disks.used).length;
                            hostList[i].totalNodeInDevice = hostList[i].freeDevices + hostList[i].usedDevices;
                            hostList[i].disks.devices = getDevices(hostList[i]);
                            changeIntoArray(hostList[i]);
                        }
                    }
                }
            });
        }

        function getDevices(host){
            var disks = host.disks;
            var disksFormat = [];
            if (disks.hasOwnProperty("used")){
                for(var usedDeviceName in disks.used){
                    disksFormat.push(disks[usedDeviceName]);
                }
            }
            if(disks.hasOwnProperty("free")){
                for(var freeDeviceName in disks.free){
                    disksFormat.push(disks[freeDeviceName]);
                }
            }
            return disksFormat;
        }

        function changeIntoArray(host){
            host.networks.eth0.ipv4 = JSON.parse(host.networks.eth0.ipv4);
        }

        $scope.$watch(angular.bind(this, function(availableHostList){
            return vm.availableHostList;
        }),function(){
            var selectedHosts = 0,
            selectedMonitors = 0,
            selectedOSD = 0,
            totalDevices = 0,
            deviceWarningSign = 0,
            selectedHostList = 0;
            angular.forEach(vm.availableHostList, function(item){
                selectedHosts += item.checkboxSelected ? 1 : 0;
                if(item.checkboxSelected && item.selectedRole){
                    selectedMonitors += item.selectedRole.indexOf("Monitor") !== -1 ? 1 : 0;
                    selectedOSD += item.selectedRole.indexOf("OSD Host") !== -1 ? 1 : 0;
                    totalDevices += item.disks ? item.totalNodeInDevice : 0;
                    deviceWarningSign += item.usedDevices ? 1 : 0;
                    selectedHostList += 1;
                }

            })
            vm.selectedHosts = selectedHosts;
            vm.selectedMonitors = selectedMonitors;
            vm.selectedOSD = selectedOSD;
            vm.totalDevices = totalDevices;
            vm.deviceWarningSign = deviceWarningSign;
            vm.selectedHostList = selectedHostList;
        }, true);


        function refreshHostList(){
            init();
        }

        vm.checkAll = function (checkValue) {
            vm.selectedAll = checkValue;
            angular.forEach(vm.availableHostList, function (item) {
                item.checkboxSelected = vm.selectedAll;
            });
        }

        vm.selectedNodes = function(){
            vm.selectedNodeList = []
            for(var index=0; index< vm.availableHostList.length; index++){
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

        function closeExpandList(){
            for(var index=0; index < vm.selectedNodeList.length; index++){
                vm.selectedNodeList[index].isExpanded = false;
            }
        }

        function expandList(item) {
            if(item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
        }

        function changeSelectedNetwork(selectedNetworkList, NetworkCheckbox){
            if (selectedNetworkList[NetworkCheckbox] === true){
                for(var index in selectedNetworkList.ipFlags){
                    selectedNetworkList.ipFlags[index][NetworkCheckbox] = true;
                }
            }else{
                for(var index in selectedNetworkList.ipFlags){
                    selectedNetworkList.ipFlags[index][NetworkCheckbox] = false;
                }
            }
        }

        function allCheckboxSelected(selectedNetworkList, NetworkCheckbox){
            var countTrue = 0;
            for(var index in selectedNetworkList.ipFlags){
                if(selectedNetworkList.ipFlags[index][NetworkCheckbox] === true){
                    countTrue +=1;
                }
            }
            if(countTrue === selectedNetworkList.ipFlags.length){
                selectedNetworkList[NetworkCheckbox] = true
            }
            else{
                selectedNetworkList[NetworkCheckbox] = false;
            }
        }

        function selectedNetworks(network){
            vm.subnet = network.subnet;
            network.selectedNetworkList = {};
            network.selectedNetworkList.ipFlags = []
            network.selectedNetworkList.clusterNetworkCheckbox = false;
            network.selectedNetworkList.publicNetworkCheckbox = false;
            network.selectedNetworkList.rgwNetworkCheckbox = false;
            for(var index=0; index<network.ipv4.length; index++){
                var ipaddr = network.ipv4[index];
                var ipFlags = { 
                    ip: ipaddr,
                    clusterNetworkCheckbox :false,
                    publicNetworkCheckbox : false,
                    rgwNetworkCheckbox : false
                }
            network.selectedNetworkList.ipFlags.push(ipFlags);
            }
        }

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
        function _resetFlag() {
            // if(vm.selectedStep === 4) {
            //     vm.selectedNodeList.map(function(curr, index, list) {
            //         curr.isExpanded = false;
            //     });
            // }
        }

        function filterNestedList(item) {
            var properties,
                property,
                searchBy;

            if(vm.selectedStep === 3) {
                searchBy = vm.diskFilterBy;
            } else if(vm.selectedStep === 4) {
                searchBy = vm.subnetFilterBy;
            }
            
            properties = searchBy.property.split(".");

            if(searchBy.value && properties.length > 1) {
                property = properties[2];
                if(item[property].toLowerCase().indexOf(searchBy.value.toLowerCase()) >= 0) {
                    return item;
                }
            } else {
                return item;
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
                list,
                len;

            if(vm.selectedStep === 3) {
                searchBy = vm.diskFilterBy;
                list = item.disks.devices;
                len = list.length;
            } else if(vm.selectedStep === 4) {
                searchBy = vm.subnetFilterBy;
                list = item.networks.eth0;
                len = list.length;
            }

            if(searchBy.value) {

                properties = searchBy.property.split(".");

                if(properties.length > 1) {
                    property = properties[2];
                   
                    for ( i = 0; i < len; i++) {
                        if(list[i][property].toLowerCase().indexOf(searchBy.value.toLowerCase()) >= 0) {
                            item.isExpanded = true;
                            return item;
                        }
                    }

                } else {
                    property = searchBy.property;

                    if(item[property].toLowerCase().indexOf(searchBy.value.toLowerCase()) >= 0) {
                        return item;
                    }
                }
                
            } else {
                return item;
            }
        };

        function partitionValue(SelectedpartitionType, disk){
            disk.partitionSize = SelectedpartitionType === 'SSD' ? 4 : 12;
        };

        vm.nextStep = function(step) {
            //validateForm(step);
            if(!vm.showMsg){
                vm.selectedStep += 1;
                
                if(vm.selectedStep === 3) {
                    vm.selectedNodes();
                }
                if(vm.selectedStep === 5) {
                    createClusterPostData();
                }
                if(vm.selectedStep >= 3) {
                    closeExpandList();
                }
                                    
            }

        };

        vm.backStep= function(step) {
            vm.selectedStep -= 1;

            if(vm.selectedStep >= 3) {
                closeExpandList();
            }

        };

        var validateForm = function(step){
            vm.showMsg;
            if(step === 1){
                vm.showMsg;
            }else if (step === 2) {
                if(vm.selectedMonitors < 3){
                    vm.showMsg = "Choose a minimum of 3 monitors to continue."
                }
                else{
                    vm.showMsg ="";
                }
            }else if (step === 3) {

            }
        };
    }
})();