(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("dashboardController", dashboardController);

    /*@ngInject*/
    function dashboardController($scope, $rootScope, $state, $interval, utils, config, eventStore, dashboardStore) {
        var vm = this,
            dashboardTimer,
            rawStorageUtilizationXData = ["percent"],
            rawStorageUtilizationYData = ["used"];

        vm.heatMapdataAvailable = false;
        vm.changeType = changeType;
        vm.clusterType = "ceph";
        vm.isDataLoading = true;
        

        init();

        function init(){
            if(vm.clusterType === "ceph"){
                cephInit();
            } else{
                glusterInit();
            }
        }

        function cephInit() {
            utils.getDashboardData("ceph", false)
                .then(function(data) {
                    $interval.cancel(dashboardTimer);
                    vm.cephCluster = data;
                    utils.getDashboardData("ceph", true)
                        .then(function(data) {
                            vm.chartData = data[0].datapoints;                            
                            vm.isDataLoading = false;
                            startTimer();
                        });
                });
        }

        function glusterInit() {
            var alerts;
            utils.getDashboardData("gluster")
                .then(function(data) {
                    $interval.cancel(dashboardTimer);
                    vm.glusterCluster = data;
                    vm.volOverviewData = vm.glusterCluster.sds_det.volume_counts;
                    vm.brickOverviewData = vm.glusterCluster.sds_det.brick_counts;
                    utils.getDashboardData("gluster", true)
                        .then(function(data) {
                            if(data && data[0] && data[0].datapoints){
                                vm.chartData = data[0].datapoints;
                            }
                            eventStore.getAlertList()
                                .then(function(alertData){
                                    alerts = dashboardStore.filterAlerts(alertData, "gluster");
                                    vm.alerts = alerts;
                                    vm.isDataLoading = false;          
                                    startTimer();
                                });
                        });
                });
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(dashboardTimer);
        });

        function startTimer() {
            dashboardTimer = $interval(function() {
                init();
            }, 1000 * config.dashboardIntervalTime, 1);
        }

        function changeType(clusterType){
            vm.clusterType = clusterType;
            vm.isDataLoading = true;
            init();
        }
    }
})();
