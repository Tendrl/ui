(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, $rootScope, $filter, $uibModal, config, utils) {

        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            clusterListTimer,
            hostList,
            i;

        vm.isDataLoading = true;
        vm.clusterNotPresent = false;

        init();

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
                vm.clusterNotPresent = true;
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

                    if (cluster.sds_name === "ceph") {
                        cluster.publicNetwork = clusterData[i].public_network;
                        cluster.clusterNetwork = clusterData[i].cluster_network;
                    } else if (cluster.sds_name === "gluster") {
                        cluster.clusterNetwork = clusterData[i].cluster_network;
                    }

                    if (typeof clusterData[i].utilization !== "undefined") {

                        if (cluster.sds_name === "ceph") {
                            cluster.utilization = clusterData[i].utilization;
                            cluster.utilization.percent_used = clusterData[i].utilization.pcnt_used;
                            cluster.status = clusterData[i].globaldetails.status || "NA";
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

                    temp.push(cluster);
                }
                vm.clusterList = temp;
            }
        }

    }

})();
