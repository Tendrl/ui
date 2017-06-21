(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, config, utils, $rootScope, $filter) {

        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            clusterListTimer,
            hostList,
            i;

        vm.importCluster = importCluster;
        vm.createCluster = createCluster;
        vm.goToClusterDetail = goToClusterDetail;
        vm.isDataLoading = true;

        init();
        startTimer();

        function init() {
            utils.getObjectList("Cluster")
                .then(function(data) {
                    $interval.cancel(clusterListTimer);
                    $rootScope.clusterData = data;
                    _createClusterList();
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0) {
                $state.go("home");
            } else {
                init();
            }
        });

        function startTimer() {

            clusterListTimer = $interval(function() {
                init();
            }, 1000 * config.refreshIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(clusterListTimer);
        });

        function importCluster() {
            $state.go("import-cluster");
        }

        function createCluster() {
            $state.go("create-cluster");
        }

        function _createClusterList() {

            if ($rootScope.clusterData !== null) {

                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                temp = [];

                for (i = 0; i < len; i++) {
                    cluster = {};

                    cluster.id = clusterData[i].cluster_id;
                    cluster.name = clusterData[i].cluster_name || "NA";
                    cluster.sds_name = clusterData[i].sds_name;
                    cluster.status = "NA";

                    if (typeof clusterData[i].utilization !== "undefined") {

                        if (cluster.sds_name === "ceph") {
                            cluster.utilization = clusterData[i].utilization;
                            cluster.utilization.percent_used = clusterData[i].utilization.pcnt_used;
                            cluster.status = clusterData[i].globaldetails.status || "NA";
                            _clusterIopsTrend(cluster);
                        } else if (cluster.sds_name === "gluster") {
                            cluster.utilization = {};
                            cluster.utilization.percent_used = clusterData[i].utilization.pcnt_used;
                            cluster.utilization.used = clusterData[i].utilization.used_capacity;
                            cluster.utilization.total = clusterData[i].utilization.usable_capacity;

                            if (clusterData[i].globaldetails.status === "healthy") {
                                cluster.status = "HEALTH_OK";
                            } else if (clusterData[i].globaldetails.status === "unhealthy") {
                                cluster.status = "HEALTH_ERR";
                            }
                        }
                    }
                    cluster.alertCount = "NA";

                    //cluster.hostCount = utils.getAssociatedHosts(hostList, clusterData[i].cluster_id).length;
                    cluster.hostCount = Object.keys(clusterData[i].nodes).length;
                    cluster.poolOrFileShareCount = "NA";
                    if (clusterData[i].sds_name === 'ceph' && typeof clusterData[i].pools !== "undefined") {
                        cluster.poolOrFileShareCount = Object.keys(clusterData[i].pools).length;
                    } else if (clusterData[i].sds_name === 'gluster' && typeof clusterData[i].volumes !== "undefined") {
                        cluster.poolOrFileShareCount = Object.keys(clusterData[i].volumes).length;
                    }
                    cluster.iops = "IOPS-NA";

                    temp.push(cluster);
                }
                vm.clusterList = temp;
            }
        }

        function _clusterIopsTrend(cluster) {
            var iopsData,
                timeInterval = "-6h";

            utils.ClusterIOPS(cluster.id, timeInterval)
                .then(function(data) {
                    vm.iopsData = data && data.stats[0] && data.stats[0].datapoints ? data.stats[0].datapoints : [];
                    if(vm.iopsData.length){
                        _generateIopsTrendChart(vm.iopsData, cluster);
                    }
                });
        }

        function _generateIopsTrendChart(iopsData, cluster) {
            cluster.dataIOPS = {
                "xData": _setupXData(iopsData),
                "yData": _setupYData(iopsData)
            };

            cluster.configIOPS = {
                "chartId": "Iops" + cluster.id + "TrendsChart",
                "title": "IOPS",
                "layout": "compact",
                "valueType": "actual",
                "units": "K",
                "tooltipType": "K"
            };
        }

        function _setupXData(iopsData) {
            var len = iopsData.length,
                i,
                xData = ["dates"];

            for (i = 0; i < len; i++) {
                if (iopsData[i][1] !== null && iopsData[i][0] !== null) {
                    xData.push(iopsData[i][1]);
                }
            }

            return xData;
        }

        function _setupYData(iopsData) {
            var len = iopsData.length,
                i,
                yData = ["K"];

            for (i = 0; i < len; i++) {
                if (iopsData[i][0] !== null && iopsData[i][1] !== null) {
                    yData.push(iopsData[i][0]);
                }
            }

            return yData;
        }

        function goToClusterDetail(cluster_id) {
            $state.go("cluster-detail", { clusterId: cluster_id });
        }
    }

})();
