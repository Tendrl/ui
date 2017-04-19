// (function() {
//     "use strict";

//     var app = angular.module("TendrlModule");

//     app.controller("createCephClusterController", createCephClusterController);

//     /*@ngInject*/
//     function createCephClusterController($rootScope, $scope, $uibModal, $filter, utils, $state) {

//         var vm = this,
//             date = new Date();


//         vm.selectedStep = 1;
//         vm.storageService ="Ceph";
//         vm.roles = ["Monitor", "OSD Host"];
//         vm.totalDevices = 0;
//         vm.diskConf = {
//             diskUnits: ['GB','MB'],
//             journalConfigrationType: ["Colocated","Dedicated"],
//             partitionType: ["SSD", "NVMe"],
//             partitionValue: partitionValue
//         };
//         vm.cephClusterName = "ceph_"+ date.getFullYear() + date.getMonth() + date.getDate() + date.getTime();
//         vm.wizardSteps = [{
//                 "number": 1,
//                 "name": "General"
//             },{
//                 "number": 2,
//                 "name": "Networks"
//             },{
//                 "number": 3,
//                 "name": "Host"
//             },{
//                 "number": 4,
//                 "name": "Journal Configuration"
//             },{
//                 "number": 5,
//                 "name": "Review"
//             }];

//         vm.diskFilterBy = {
//             "property": "fqdn",
//             "value": ""
//         };

//         vm.subnetFilterBy = {
//             "property": "networks.eth0.subnet",
//             "value": ""
//         };
//         vm.showSelectionWarning = false;

//         vm.clusterNetwork = [];
//         vm.publicNetwork = [];
//         vm.filteredList = [];
//         vm.selectedNWHost = [];
//         vm.selectedRoleHost = [];

//         vm.refreshHostList = refreshHostList;
//         vm.filterNestedList = filterNestedList;
//         vm.filterList = filterList;
//         vm.expandList = expandList;
//         vm.changeSelectedNetwork = changeSelectedNetwork;
//         vm.allCheckboxSelected =allCheckboxSelected;
//         vm.deviceWarningMsg = "Some devices contain user data and will be repartitioned on cluster creation. Any existing data will be lost."
//         vm.createPublicNetwork = createPublicNetwork;
//         vm.filterByCN = filterByCN;
//         vm.filterByPN = filterByPN;
//         vm.filterHostByPN = filterHostByPN;
//         vm.selectNWHost = selectNWHost;
//         vm.isSelectedNWHost = isSelectedNWHost;
//         vm.validateFields = validateFields;
//         vm.updateOSDMonCount = updateOSDMonCount;

//         init();
//         /* Trigger this function when we have cluster data */
//         $scope.$on("GotClusterData", function (event, data) {
//             init();
//         });

//         function init() {
//             vm.isDataLoading = true;
//             vm.totalDevices = 0
//             vm.availableHostList = [];
//             vm.updatedHostList = [];
//             vm.subnetList = [];

//             utils.getObjectList("Node").then(function(list) {
//                 vm.isDataLoading = false;
//                 var hostList = list.nodes;
                
//                 if(list !== null && hostList.length !== 0) {
//                     for(var i = 0; i<hostList.length ; i++){
//                         if (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === ""){
//                             vm.availableHostList.push(hostList[i]);
//                             vm.totalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
//                             // hostList[i].freeDevices = Object.keys(hostList[i].disks.free).length;
//                             // hostList[i].usedDevices = Object.keys(hostList[i].disks.used).length;
//                             // hostList[i].totalNodeInDevice = hostList[i].freeDevices + hostList[i].usedDevices;
//                             //hostList[i].disks.devices = getDevices(hostList[i]);
//                             changeIntoArray(hostList[i]);
//                             //_createSubnetMapping(hostList[i]);
//                             _createHostList(hostList[i]);
//                             //vm.filteredList = $filter("filter")(vm.updatedHostList, vm.filterByCN);
//                             vm.createPublicNetwork();
//                         }
//                     }
//                 }

//                 if(vm.availableHostList && vm.availableHostList.length >= 3) {
//                     vm.enablePOCIntendedUsage = true;
//                     vm.enableProIntendedUsage = true;
//                     vm.intendedUsage = "production";
//                 } else if(vm.availableHostList && vm.availableHostList.length >= 1) {
//                     vm.enablePOCIntendedUsage = true;
//                     vm.enableProIntendedUsage = false;
//                     vm.intendedUsage = "poc";  
//                 }
                
//             });
//         }

//         function validateFields() {
//             var flag = false;
//             vm.showSelectionWarning = false;

//             if(vm.selectedStep == 2) {
                
//                 if(vm.intendedUsage === "production") {                
//                     flag = vm.selectedNWHost.length < 3;
                    
//                     if(flag) {
//                         vm.hostSelectionMsg = "Minimum 3 hosts should be selected for Production";
//                         vm.showSelectionWarning = true;
//                     }
//                 } else if(vm.intendedUsage === "poc") {
//                     flag = vm.selectedNWHost.length < 1;
                    
//                     if(flag) {
//                         vm.hostSelectionMsg = "Minimum 1 host should be selected for POC";
//                         vm.showSelectionWarning = true;
//                     }
//                 }

//                 return flag; 
//             }
//         }

//         function selectNWHost(host) {
            
//             var hostIndex;

//             if (typeof host === "boolean") {
                
//                 if(host) {
//                     vm.selectedNWHost = vm.filteredList.slice(0); 
//                 } else {
//                     vm.selectedNWHost = [];
//                 }

//             } else if (typeof host === "object") {
//                 hostIndex = vm.selectedNWHost.indexOf(host);

//                 if (hostIndex === -1) {
//                     vm.selectedNWHost.push(host);
//                 } else {
//                     vm.selectedNWHost.splice(hostIndex, 1);
//                 }
//             }

//             console.log(vm.selectedNWHost, "selectedNWHost");

//             vm.allNWHostChecked = vm.selectedNWHost.length === vm.filteredList.length;
//         }

//         function isSelectedNWHost(host) {
//             return vm.selectedNWHost.indexOf(host) > -1;
//         }

//         function createPublicNetwork() {
//             var len,
//                 subnetLen,
//                 i,
//                 j;
                
//             vm.publicNetwork = [];
//             vm.filteredList = vm.filterListByCN = $filter("filter")(vm.updatedHostList, vm.filterByCN);
//             len = vm.filteredList.length

//             for ( i = 0; i < len; i++) {
//                 subnetLen = vm.filteredList[i].subnets.length;

//                 for ( j = 0; j < subnetLen; j++) {
//                     if(vm.publicNetwork.indexOf(vm.filteredList[i].subnets[j]) === -1) {
//                         vm.publicNetwork.push(vm.filteredList[i].subnets[j]);
//                     }
//                 }
//             }

//             vm.selectedPublicNetwork = vm.publicNetwork[0];
//             vm.filteredList = vm.filteredListByPN = $filter("filter")(vm.filterListByCN, vm.filterByPN);
//         };

//         function filterByCN(host) {
//             if(host.subnets.indexOf(vm.selectedClusterNetwork) !== -1) {
//                 return host;
//             }
//         }

//         function filterByPN(host) {
//             if(host.subnets.indexOf(vm.selectedPublicNetwork) !== -1) {
//                 return host;
//             }
//         }

//         function filterHostByPN() {
//             vm.filteredList = $filter("filter")(vm.filterListByCN, vm.filterByPN);   
//         }

//         function _createHostList(host) {
//             var interfaceKeys = Object.keys(host.networks),
//                 len = interfaceKeys.length,
//                 interfaces = [],
//                 hostIP = [],
//                 subnets = [],
//                 ipLen,
//                 ip,
//                 i,
//                 j,
//                 obj = {};

//             obj.fqdn = host.fqdn;
//             obj.interfaces = [];
//             obj.hostIP = [];
//             obj.subnets = [];
//             obj.freeDevices = host.disks.free ? Object.keys(host.disks.free).length : 0;
//             obj.usedDevices = host.disks.used ? Object.keys(host.disks.used).length : 0;
//             obj.totalNodeInDevice = obj.freeDevices + obj.usedDevices;
//             obj.selectedRole = "Monitor";


//             for ( i = 0; i < len; i++) {
//                 obj.interfaces.push(interfaceKeys[i]);
                
//                 ip = host.networks[interfaceKeys[i]].ipv4;
//                 ipLen = ip.length;

//                 for ( j = 0; j < ipLen; j++) {
//                     if(obj.hostIP.indexOf(ip[j]) === -1) {
//                         obj.hostIP.push(ip[j]);
//                     }
//                 }

//                 if(obj.subnets.indexOf(host.networks[interfaceKeys[i]].subnet) === -1) {
//                     obj.subnets.push(host.networks[interfaceKeys[i]].subnet);
//                     _createClusterNetwork(host.networks[interfaceKeys[i]].subnet);
//                 }

//                 obj.selectedHostIP = obj.hostIP[0];
//                 obj.selectedInterface = obj.interfaces[0];
//                 vm.selectedClusterNetwork = vm.clusterNetwork[0];
                
//             }

//             vm.updatedHostList.push(obj);
//             console.log(obj);
//         }

//         function _createClusterNetwork(subnet) {
//             if(vm.clusterNetwork.indexOf(subnet) === -1) {
//                 vm.clusterNetwork.push(subnet);
//             }
//         }

//         function updateOSDMonCount() {
//             var len = vm.avaialableHostForRole.length,
//                 i;

//             vm.selectedMonitors = 0;
//             vm.selectedOSDs = 0;

//             for (i = 0; i < len; i++) {

//                 if(vm.avaialableHostForRole[i].selectedRole === "Monitor") {
//                     vm.selectedMonitors += 1;
//                 } else if(vm.avaialableHostForRole[i].selectedRole === "OSD Host") {
//                     vm.selectedOSDs += 1;
//                 }
//             }
//         }

//         function getDevices(host){
//             var disks = host.disks;
//             var disksFormat = [];
//             if (disks.hasOwnProperty("used")){
//                 for(var usedDeviceName in disks.used){
//                     disksFormat.push(disks[usedDeviceName]);
//                 }
//             }
//             if(disks.hasOwnProperty("free")){
//                 for(var freeDeviceName in disks.free){
//                     disksFormat.push(disks[freeDeviceName]);
//                 }
//             }
//             return disksFormat;
//         }

//         function changeIntoArray(host){
//             var i,
//                 interfaces = Object.keys(host.networks),
//                 len = interfaces.length;

//             for ( i = 0; i < len; i++) {
//                 host.networks[interfaces[i]].ipv4 = JSON.parse(host.networks[interfaces[i]].ipv4);
//             }
//         }

//         // $scope.$watch(angular.bind(this, function(avaialableHostForRole){
//         //     return vm.avaialableHostForRole;
//         // }),function(){
//         //     var selectedHosts = 0,
//         //     selectedMonitors = 0,
//         //     selectedOSD = 0,
//         //     totalDevices = 0,
//         //     deviceWarningSign = 0,
//         //     selectedHostList = 0;
//         //     angular.forEach(vm.avaialableHostForRole, function(item){
//         //         selectedHosts += item.checkboxSelected ? 1 : 0;
//         //         if(item.checkboxSelected && item.selectedRole){
//         //             selectedMonitors += item.selectedRole.indexOf("Monitor") !== -1 ? 1 : 0;
//         //             selectedOSD += item.selectedRole.indexOf("OSD Host") !== -1 ? 1 : 0;
//         //             totalDevices += item.totalNodeInDevice;
//         //             deviceWarningSign += item.usedDevices ? 1 : 0;
//         //             selectedHostList += 1;
//         //         }

//         //     })
//         //     vm.selectedHosts = selectedHosts;
//         //     vm.selectedMonitors = selectedMonitors;
//         //     vm.selectedOSD = selectedOSD;
//         //     vm.totalDevices = totalDevices;
//         //     vm.deviceWarningSign = deviceWarningSign;
//         //     vm.selectedHostList = selectedHostList;
//         // }, true);


//         function refreshHostList(){
//             init();
//         }

//         vm.checkAll = function (checkValue) {
//             vm.selectedAll = checkValue;
//             angular.forEach(vm.avaialableHostForRole, function (item) {
//                 item.checkboxSelected = vm.selectedAll;
//             });
//         }

//         vm.selectedNodes = function(){
//             vm.selectedNodeList = []
//             for(var index=0; index< vm.avaialableHostForRole.length; index++){
//                 if(vm.availableHostList[index].checkboxSelected && vm.availableHostList[index].selectedRole){
//                     vm.selectedNodeList.push(vm.availableHostList[index]);
//                     vm.selectedNodeList[index].customselectedUnit = "GB";
//                     vm.selectedNodeList[index].selectedJournalConfigration = "Colocated";
//                     vm.selectedNodeList[index].partitionSize = 4;
//                     vm.selectedNodeList[index].selectedPartitionType = "SSD";
//                     // vm.selectedNodeList.selectedTotalDevices += hostList[i].disks ? hostList[i].disks.devices.length : 0;
//                     // vm.selectedNodeList.selectedTotalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
//                     vm.selectedNodeList[index].checkboxSelected = vm.availableHostList[index].checkboxSelected;
//                     vm.selectedNodeList[index].selectedRole = vm.availableHostList[index].selectedRole;
//                     vm.selectedNodeList[index].totalNodeInDevice = vm.availableHostList[index].totalNodeInDevice;
//                     selectedNetworks(vm.selectedNodeList[index].networks.eth0);
//                 }
//             }
//             return vm.selectedNodeList;
//         };

//         function closeExpandList(){
//             for(var index=0; index < vm.selectedNodeList.length; index++){
//                 vm.selectedNodeList[index].isExpanded = false;
//             }
//         }

//         function expandList(item) {
//             if(item.isExpanded) {
//                 item.isExpanded = false;
//             } else {
//                 item.isExpanded = true;
//             }
//         }

//         function changeSelectedNetwork(selectedNetworkList, NetworkCheckbox){
//             if (selectedNetworkList[NetworkCheckbox] === true){
//                 for(var index in selectedNetworkList.ipFlags){
//                     selectedNetworkList.ipFlags[index][NetworkCheckbox] = true;
//                 }
//             }else{
//                 for(var index in selectedNetworkList.ipFlags){
//                     selectedNetworkList.ipFlags[index][NetworkCheckbox] = false;
//                 }
//             }
//         }

//         function allCheckboxSelected(selectedNetworkList, NetworkCheckbox){
//             var countTrue = 0;
//             for(var index in selectedNetworkList.ipFlags){
//                 if(selectedNetworkList.ipFlags[index][NetworkCheckbox] === true){
//                     countTrue +=1;
//                 }
//             }
//             if(countTrue === selectedNetworkList.ipFlags.length){
//                 selectedNetworkList[NetworkCheckbox] = true
//             }
//             else{
//                 selectedNetworkList[NetworkCheckbox] = false;
//             }
//         }

//         function selectedNetworks(network){
//             vm.subnet = network.subnet;
//             network.selectedNetworkList = {};
//             network.selectedNetworkList.ipFlags = []
//             network.selectedNetworkList.clusterNetworkCheckbox = false;
//             network.selectedNetworkList.publicNetworkCheckbox = false;
//             network.selectedNetworkList.rgwNetworkCheckbox = false;
//             for(var index=0; index<network.ipv4.length; index++){
//                 var ipaddr = network.ipv4[index];
//                 var ipFlags = { 
//                     ip: ipaddr,
//                     clusterNetworkCheckbox :false,
//                     publicNetworkCheckbox : false,
//                     rgwNetworkCheckbox : false
//                 }
//             network.selectedNetworkList.ipFlags.push(ipFlags);
//             }
//         }

//         function createClusterPostData(){
//             var postData = {},
//             sds_parameters = {},
//             node_configuration = {},
//             conf_overrides =  {
//             "global":{
//                 "osd_pool_default_pg_num":128,
//                 "pool_default_pgp_num":1
//                 }
//             },
//             role = {
//                 "Monitor": "ceph/mon",
//                 "OSD Host": "osd"
//             }

//             sds_parameters.name = vm.cephClusterName;
//             sds_parameters.public_network = vm.subnet;
//             sds_parameters.cluster_network = vm.subnet;
//             sds_parameters.conf_overrides = conf_overrides;
//             postData.sds_parameters = sds_parameters;
//             postData.node_identifier = "ip";

//             for(var index = 0; index < vm.selectedNodes.length; index++){
//                 var network = vm.selectedNodes[index].networks.eth0;
//                 for(var index1=0; index1<network.ipv4.length; index1++){
//                     ip = network.ipv4[index1];
//                     ip.provisioning_ip = ip;
//                     ip.monitor_interface = network.interface;
//                     ip.role = role[vm.selectedRole[0]];
//                     node_configuration.push(ip)
//                 }
//             }
//             postData.node_configuration = node_configuration;
//             console.log(postData);
//         }

//         function filterNestedList(item) {
//             var properties,
//                 property,
//                 searchBy;

//             if(vm.selectedStep === 3) {
//                 searchBy = vm.diskFilterBy;
//             } else if(vm.selectedStep === 4) {
//                 searchBy = vm.subnetFilterBy;
//             }
            
//             properties = searchBy.property.split(".");

//             if(searchBy.value && properties.length > 1) {
//                 property = properties[2];
//                 if(item[property].toLowerCase().indexOf(searchBy.value.toLowerCase()) >= 0) {
//                     return item;
//                 }
//             } else {
//                 return item;
//             }
//         }


//         function filterList(item) {
//             var properties,
//                 property,
//                 i,
//                 diskLen,
//                 disks,
//                 searchBy = {},
//                 eth,
//                 ethlen,
//                 list,
//                 len;

//             if(vm.selectedStep === 3) {
//                 searchBy = vm.diskFilterBy;
//                 list = item.disks.devices;
//                 len = list.length;
//             } else if(vm.selectedStep === 4) {
//                 searchBy = vm.subnetFilterBy;
//                 list = item.networks.eth0;
//                 len = list.length;
//             }

//             if(searchBy.value) {

//                 properties = searchBy.property.split(".");

//                 if(properties.length > 1) {
//                     property = properties[2];
                   
//                     for ( i = 0; i < len; i++) {
//                         if(list[i][property].toLowerCase().indexOf(searchBy.value.toLowerCase()) >= 0) {
//                             item.isExpanded = true;
//                             return item;
//                         }
//                     }

//                 } else {
//                     property = searchBy.property;

//                     if(item[property].toLowerCase().indexOf(searchBy.value.toLowerCase()) >= 0) {
//                         return item;
//                     }
//                 }
                
//             } else {
//                 return item;
//             }
//         };

//         function partitionValue(SelectedpartitionType, disk){
//             disk.partitionSize = SelectedpartitionType === 'SSD' ? 4 : 12;
//         };

//         vm.nextStep = function(step) {
//             //validateForm(step);
//             if(!vm.showMsg){
//                 vm.selectedStep += 1;
                
//                 if(vm.selectedStep === 3) {
//                     vm.avaialableHostForRole = vm.selectedNWHost;
//                     _calculateSummaryValues();
//                     //vm.selectedNodes();
//                 }
//                 if(vm.selectedStep === 5) {
//                     createClusterPostData();
//                 }
                
//                 // if(vm.selectedStep >= 3) {
//                 //     closeExpandList();
//                 // }
                    
//             }

//         };

//         function _calculateSummaryValues() {
//             var len = vm.avaialableHostForRole.length,
//                 i;

//             vm.totalDevices = 0;
//             vm.selectedMonitors = 0;
//             vm.selectedOSDs = 0;

//             for (i = 0; i < len; i++) {
//                 vm.totalDevices += vm.avaialableHostForRole[i].totalNodeInDevice;
                
//                 if(vm.avaialableHostForRole[i].selectedRole === "Monitor") {
//                     vm.selectedMonitors += 1;
//                 } else if(vm.avaialableHostForRole[i].selectedRole === "OSD Host") {
//                     vm.selectedOSDs += 1;
//                 }
//             }
//         }

//         vm.backStep= function(step) {
//             vm.selectedStep -= 1;

//             if(vm.selectedStep >= 3) {
//                 closeExpandList();
//             }

//         };

//         var validateForm = function(step){
//             vm.showMsg;
//             if(step === 1){
//                 vm.showMsg;
//             }else if (step === 2) {
//                 if(vm.selectedMonitors < 3){
//                     vm.showMsg = "Choose a minimum of 3 monitors to continue."
//                 }
//                 else{
//                     vm.showMsg ="";
//                 }
//             }else if (step === 3) {

//             }
//         };
//     }
// })();