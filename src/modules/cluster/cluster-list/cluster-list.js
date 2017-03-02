(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, config, utils, $rootScope) {

        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            timer,
            hostList,
            i;

        vm.importCluster = importCluster;
        vm.goToClusterDetail = goToClusterDetail;
        vm.isDataLoading = true;

        init();

        function init() {
            utils.getObjectList("Node")
                .then(function(data) {
                    vm.isDataLoading = false;
                    hostList = data.nodes;
                    _createClusterList();
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

        timer = $interval(function() {

            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    init();
                });

        }, 1000 * config.refreshIntervalTime);

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(timer);
        });

        function importCluster() {
            $state.go("import-cluster");
        }

        function _createClusterList() {

            if ($rootScope.clusterData !== null) {

                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                temp = [];

                for (i = 0; i < len; i++) {
                    cluster = {};

                    cluster.id = clusterData[i].cluster_id;
                    cluster.name = clusterData[i].integration_name || "NA";
                    cluster.sds_name = clusterData[i].sds_name;
                    cluster.status = "NA";

                    if (typeof clusterData[i].utilization !== "undefined") {

                        if (cluster.sds_name === "ceph") {
                            cluster.utilization = clusterData[i].utilization;
                            cluster.utilization.percent_used = clusterData[i].utilization.pcnt_used;
                            cluster.status = clusterData[i].globaldetails.status;
                        } else if (cluster.sds_name === "glusterfs") {
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

                    cluster.hostCount = utils.getAssociatedHosts(hostList, clusterData[i].cluster_id).length;
                    cluster.poolOrFileShareCount = "NA";
                    if (clusterData[i].sds_name === 'ceph' && typeof clusterData[i].pools !== "undefined") {
                        cluster.poolOrFileShareCount = Object.keys(clusterData[i].pools).length;
                    } else if (clusterData[i].sds_name === 'glusterfs' && typeof clusterData[i].volumes !== "undefined") {
                        cluster.poolOrFileShareCount = Object.keys(clusterData[i].volumes).length;
                    }
                    cluster.iops = "IOPS-NA";

                    temp.push(cluster);
                }
                vm.clusterList = temp;
            }
        }

        function goToClusterDetail(cluster_id) {
            $state.go("cluster-detail", { clusterId: cluster_id });
        }
    }

})();
