(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createCephClusterController", createCephClusterController);

    /*@ngInject*/
    function createCephClusterController($rootScope, $scope, utils, $state, $uibModal) {

        var vm = this,
            date = new Date();


        vm.selectedStep = 1;
        vm.storageService ="Red Hat Ceph Storage";
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
            "property": "networks.eth0.ipv4",
            "value": ""
        };

        vm.refreshHostList = refreshHostList;
        vm.filterNestedList = filterNestedList;
        vm.filterList = filterList;
        vm.expandList = expandList;

        init();
        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            init();
        });

        function init() {
            vm.isDataLoading = true;
            vm.totalDevices = 0
            vm.availableHostList = [];
            utils.getObjectList("DemoNode").then(function(list) {
                vm.isDataLoading = false;
                var hostList = list.nodes;
                if(list !== null && hostList.length !== 0) {
                    for(var i=0;i<hostList.length;i++){
                        if (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === ""){
                            vm.availableHostList.push(hostList[i]);
                            vm.totalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
                        }
                    }
                }
            });
        }

        $scope.$watch(angular.bind(this, function(availableHostList){
            return vm.availableHostList;
        }),function(){
            var selectedHosts = 0,
            selectedMonitors = 0,
            selectedOSD = 0,
            totalDevices = 0,
            selectedHostList = 0;
            angular.forEach(vm.availableHostList, function(item){
                selectedHosts += item.checkboxSelected ? 1 : 0;
                if(item.checkboxSelected && item.selectedRole){
                    selectedMonitors += item.selectedRole.indexOf("Monitor") !== -1 ? 1 : 0;
                    selectedOSD += item.selectedRole.indexOf("OSD Host") !== -1 ? 1 : 0;
                    totalDevices += item.disks ? item.disks.devices.length : 0;
                    selectedHostList += 1;

                }
            })
            vm.selectedHosts = selectedHosts;
            vm.selectedMonitors = selectedMonitors;
            vm.selectedOSD = selectedOSD;
            vm.totalDevices = totalDevices;
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
                    // vm.selectedNodeList.selectedTotalDevices += hostList[i].disks ? hostList[i].disks.devices.length : 0;
                    // vm.selectedNodeList.selectedTotalRawCapacity += hostList[i].stats ? hostList[i].stats.storage.total : 0;
                    vm.selectedNodeList[index].checkboxSelected = vm.availableHostList[index].checkboxSelected;
                    vm.selectedNodeList[index].selectedRole = vm.availableHostList[index].selectedRole;
                    vm.selectedNodeList[index].isExpanded = false;
                }
            }
            return vm.selectedNodeList;
        };

        function expandList(item) {
            if(item.isExpanded) {
                item.isExpanded = false;
            } else {
                item.isExpanded = true;
            }
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
                
                if(vm.selectedStep >= 3) {
                    vm.selectedNodes();
                }
            }

        };

        vm.backStep= function(step) {
            vm.selectedStep -= 1;

            if(vm.selectedStep >= 3) {
                vm.selectedNodes();
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

        vm.config = {
            useExpandingRows: true,
            showSelectBox: false
        };
    }
})();