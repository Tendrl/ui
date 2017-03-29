(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("createCephClusterController", createCephClusterController);

    /*@ngInject*/
    function createCephClusterController($rootScope, $scope, utils, $state, $templateCache) {

        var vm = this;

        vm.selectedStep = 3;
        
        vm.storageService ="Red Hat Ceph Storage";

        vm.roles = ["Monitor", "OSD Host"];
        init();
        
        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            init();
        });

        vm.checkAll = function (checkValue) {
            vm.selectedAll = checkValue;
            angular.forEach(vm.availableHostList, function (item) {
                item.checkboxSelected = vm.selectedAll;
            });
        }

        vm.nextStep = function(step) {
            //validateForm(step);
            if(!vm.showMsg){
                vm.selectedStep += 1;
            }
        };

        vm.backStep= function(step) {
            vm.selectedStep -= 1;
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

        $scope.$watch(angular.bind(this, function(availableHostList){
            return vm.availableHostList;
        }),function(){
            var selectedHosts = 0,
            selectedMonitors = 0,
            selectedOSD = 0;
            angular.forEach(vm.availableHostList, function(item){
                selectedHosts += item.checkboxSelected ? 1 : 0;
                if(item.checkboxSelected){
                    selectedMonitors += item.selectedRole.indexOf("Monitor") !== -1 ? 1 : 0;
                    selectedOSD += item.selectedRole.indexOf("OSD Host") !== -1 ? 1 : 0;
                }
            })
            vm.selectedHosts = selectedHosts;
            vm.selectedMonitors = selectedMonitors;
            vm.selectedOSD = selectedOSD;
        }, true);  

        function init() {
            utils.getObjectList("Device").then(function(list) {
                vm.diskList = list;
            });
        };

        vm.wizardSteps = [{
            "number": 1,
            "name": "General"
        },
        {
            "number": 2,
            "name": "Hosts"
        },
        {
            "number": 3,
            "name": "Device Configration"
        },
        {
            "number": 4,
            "name": "Network"
        },
        {
            "number": 5,
            "name": "Review"
        }];

        vm.hostSummary = {
            "devices": 4,
            "totalRawCapacity": 65757652763,
        };

        vm.availableHostList = [{
            "checkboxSelected": false,
            "name": "ceph-node1.tendrl.org1",
            "ip":"122.233.2.2",
            "interfaces": 3,
            "devices": 2,
            "rawCapacity": 24532131,
            "usableCapacity": 3402132131,
            "selectedRole":"",
            "roles": vm.roles
        },{
            "checkboxSelected": false,
            "name": "ceph-node1.tendrl.org1",
            "ip":"122.233.2.2",
            "interfaces": 3,
            "devices": 2,
            "rawCapacity": 245312312,
            "usableCapacity": 340213213,
            "selectedRole":"",
            "roles": vm.roles
        },{
            "checkboxSelected": false,
            "name": "ceph-node1.tendrl.org1",
            "ip":"122.233.2.2",
            "interfaces": 3,
            "devices": 2,
            "rawCapacity": 2452132131,
            "usableCapacity": 34021321321,
            "selectedRole":"",
            "roles": vm.roles
        }];

        vm.exampleChartConfig = {
            'chartId': 'pctChart',
            'units': 'GB',
            'thresholds': {
              'warning':'60',
              'error':'90'
            }
        };

        vm.config = {
            useExpandingRows: true,
            showSelectBox: false
        };

        function partitionValue(SelectedpartitionType, disk){
            disk.partitionSize = SelectedpartitionType === 'SSD' ? 4 : 12;
        };

        vm.customScope = {
            units: ['GB','MB'],
            journalConfigrationType: ["Colocated","Dedicated"],
            partitionType: ["SSD", "NVMe"],
            partitionValue: partitionValue
        }
    }
})();