(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("dashboardController", dashboardController);

    /*@ngInject*/
    function dashboardController($scope, $rootScope, $state, $interval, utils, config, eventStore, dashboardStore) {
        var vm = this,
            dashboardTimer,
            alerts;

        vm.heatMapdataAvailable = false;
        vm.changeType = changeType;
        vm.isDataLoading = true;
        vm.noClusterFound = false;

        init();

        function init(){
            utils.getObjectList("Cluster")
                .then(function(data) {
                    vm.dashboardNavtabs = [];
                    _countTypeOfClusters(data.clusters);
                    _checkClusterType();
                });
        }

        function _checkClusterType() {
            if (vm.clusterType === "Ceph") {
                cephInit();
            } else if (vm.clusterType === "Gluster"){
                glusterInit();
            }
        }

        function _countTypeOfClusters(clusters){
            var i,
                clusterslen = clusters.length,
                cephCount = 0,
                glusterCount = 0;

            for (i = 0; i < clusterslen; i++){
                if(!cephCount && clusters[i].sds_name === "ceph"){
                    cephCount += 1;
                } else if (!glusterCount && clusters[i].sds_name === "gluster") {
                    glusterCount += 1;
                }
                if(cephCount && glusterCount){
                    break;
                }
            }
            _appendingDashboardNavTabs(cephCount, glusterCount);
        }

        function _appendingDashboardNavTabs(cephCount, glusterCount){
            if(cephCount && glusterCount){
                vm.dashboardNavtabs.push({"clusterName": "Ceph"});
                vm.dashboardNavtabs.push({"clusterName": "Gluster"});
                vm.clusterType = "Ceph";
            } else if(cephCount){
                vm.dashboardNavtabs.push({"clusterName": "Ceph"});
                vm.clusterType = "Ceph";
            } else if(glusterCount){
                vm.dashboardNavtabs.push({"clusterName": "Gluster"});
                vm.clusterType = "Gluster";
            } else {
                vm.noClusterFound = true;
            }
        }

        function cephInit() {
            utils.getDashboardData("ceph", false)
                .then(function(data) {
                    $interval.cancel(dashboardTimer);
                    vm.cephCluster =  data;
                    return utils.getDashboardData("ceph", "cluster", "utilization");
                })
                .then(function(data) {
                    vm.chartData = data.length && data[0].datapoints ? data[0].datapoints : [];
                    return eventStore.getAlertList();
                })
                .then(function(alertData) {
                    alerts = dashboardStore.filterAlerts(alertData, "ceph");
                    vm.alerts = alerts;
                    vm.isDataLoading = false;
                    startTimer();
                })
        }

        function glusterInit() {
            utils.getDashboardData("gluster")
                .then(function(data) {
                    $interval.cancel(dashboardTimer);
                    vm.glusterCluster = data;
                    if(typeof vm.glusterCluster !== "undefined"){
                        vm.volOverviewData = vm.glusterCluster.sds_det.most_used_volumes;
                        vm.brickOverviewData = vm.glusterCluster.sds_det.most_used_bricks;
                    }
                    return utils.getDashboardData("gluster", "cluster", "utilization");
                })
                .then(function(data) {
                    vm.chartData = data.length && data[0].datapoints ? data[0].datapoints : [];
                    return eventStore.getAlertList();
                })
                .then(function(alertData) {
                    alerts = dashboardStore.filterAlerts(alertData, "gluster");
                    vm.alerts = alerts;
                    vm.isDataLoading = false;
                    startTimer();
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

        function changeType(clusterType) {
            vm.clusterType = clusterType;
            vm.isDataLoading = true;
            init();
        }
    }
})();
