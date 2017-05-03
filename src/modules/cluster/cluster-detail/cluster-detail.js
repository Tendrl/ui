(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterDetailController", clusterDetailController);

    /*@ngInject*/
    function clusterDetailController($state, $stateParams, utils, $scope, $rootScope, dashboardStore, $interval, eventStore, config) {

        var vm = this,
            clusterDetailTimer;

        vm.tabList = {"Overview":1,
                      "Hosts": 2
                    };

        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;

        init();
        /* Adding clusterId in scope so that it will be accessible inside child directive */
        function init(){
            $scope.clusterId = $stateParams.clusterId;
            if (!$rootScope.clusterData) {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        _setClusterDetail();
                });
            } else {
                _setClusterDetail();
            }
        }


        function _setClusterDetail() {
            vm.clusterObj = utils.getClusterDetails($scope.clusterId);
            vm.clusterName = vm.clusterObj.cluster_name || "NA";
            vm.clusterStatus = checkStatus(vm.clusterObj);
            if (vm.clusterObj.sds_name === "gluster") {
                vm.tabList.FileShares = 3;
                _glusterClusterSpecificData($scope.clusterId);
            } else {
                vm.tabList.Pools = 3;
                vm.tabList.RBDs = 4;
                _cephClusterSpecificData($scope.clusterId);
            }
            vm.activeTab = vm.tabList["Overview"];
        }

        function checkStatus(clusterObj){
            var status;
            if (clusterObj.globaldetails.status === "healthy") {
                status = "HEALTH_OK";
            } else if (clusterObj.globaldetails.status === "unhealthy") {
                status = "HEALTH_ERR";
            } else {
                status = clusterObj.globaldetails.status;
            }
            return status;
        }

        function _glusterClusterSpecificData(clusterId){
            dashboardStore.getClusterDashboardList(clusterId)
                .then(function(dashboardData){
                    $interval.cancel(clusterDetailTimer);
                    vm.clusterData = dashboardData;
                    vm.volOverviewData = vm.clusterData.sds_det.volume_status_wise_counts;
                    vm.brickOverviewData = vm.clusterData.sds_det.brick_status_wise_counts;
                    dashboardStore.getClusterDashboardUtilizationList(clusterId)
                        .then(function(chartData){
                            vm.chartData = chartData;
                            eventStore.getAlertList()
                                .then(function(alertData){
                                    vm.alerts = dashboardStore.filterAlerts(alertData, "gluster");
                                    vm.isDataLoading = false;
                                    startTimer();
                            });
                    });
            });
        }

        function _cephClusterSpecificData(clusterId){
            dashboardStore.getClusterDashboardList(clusterId)
                .then(function(cephDashboardData){
                    $interval.cancel(clusterDetailTimer);
                    vm.cephCluster = cephDashboardData;
                    dashboardStore.getClusterDashboardUtilizationList(clusterId)
                        .then(function(cephChartData){
                            vm.cephChartData = cephChartData;
                            vm.isDataLoading = false;
                            startTimer();
                    });
            });
        }

        function startTimer() {
            clusterDetailTimer = $interval(function() {
                init();
            }, 1000 * config.dashboardIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterDetailTimer);
        });

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

    }

})();
