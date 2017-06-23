(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("cephDashboardController", cephDashboardController);

    app.component("cephDashboard", {
        bindings: {
            cephCluster: "<",
            chartData: "=?",
            showClusterData: "=?",
            showSystemPerformance: "=?",
            alerts: "=?",
            iopsData: "=?",
            latencyData: "=?",
            clusterNetworkData: "=?",
            publicNetworkData: "<",
            showTrendChart: "=?"
        },
        controller: "cephDashboardController",
        controllerAs: "vm",
        templateUrl: "/commons/components/ceph-dashboard/ceph-dashboard.html"
    });

    function cephDashboardController($scope, $rootScope, dashboardStore) {
        var vm = this,
            i,
            checkTime,
            rawStorageUtilizationXData = ["percent"],
            rawStorageUtilizationYData = ["used"];

        vm.$onChanges = function(changesObj) {
            if (vm.showClusterData && vm.cephCluster) {
                clusterData(vm.cephCluster);
            }
            if(vm.cephCluster){
                clusterHost(vm.cephCluster);
                clusterMon();
                clusterOsd();
                clusterPG(vm.cephCluster.sds_det.pg_status_wise_counts);
                vm.poolBarChartTitleData = poolChartTitleData(vm.cephCluster.sds_det.pool_status_wise_counts);
                vm.poolBarChartData = poolBarChartData();
                vm.rbdBarChartTitleData = rbdChartTitleData(vm.cephCluster.sds_det.rbd_status_wise_counts);
                vm.rbdBarChartData = rbdBarChartData();
                rawStorageUtilization(vm.cephCluster);
                vm.cephAlerts = vm.alerts;
            }
            if (vm.showSystemPerformance && vm.cephCluster) {
                defaultSystemPerformanceSettings(vm.cephCluster.node_summaries);
                vm.heatMapData = dashboardStore.systemPerformance(vm.cephCluster.node_summaries);
            }
            if(vm.showTrendChart){
                trendChartData();
                vm.cephIopsData = vm.iopsData;
                vm.cephLatencyData = vm.latencyData;
                vm.cephClusterNetworkData = vm.clusterNetworkData;
                vm.cephPublicNetworkData = vm.publicNetworkData;
            }
        };

        function clusterData(clusterData) {
            var clusterCountData = clusterData.cluster_count,
                downClusters = clusterCountData.status.total -
                (clusterCountData.status.HEALTH_OK ? clusterCountData.status.HEALTH_OK : 0 +
                    clusterCountData.status.HEALTH_WARN ? clusterCountData.status.HEALTH_WARN : 0 +
                    clusterCountData.status.healthy ? clusterCountData.status.healthy : 0);

            vm.clusterStatus = {
                "title": "Cluster",
                "count": clusterCountData.status.total ? clusterCountData.status.total : 0,
                "notifications": [{
                    "iconClass": "fa fa-arrow-circle-o-down",
                    "count": downClusters,
                }, {
                    "iconClass": "pficon  pficon-resources-almost-full",
                    "count": (clusterCountData.near_full ? clusterCountData.near_full : 0),
                }, {
                    "iconClass": "pficon pficon-error-circle-o",
                    "count": (clusterCountData.critical_alerts ? clusterCountData.critical_alerts : 0),
                }, {
                    "iconClass": "pficon pficon-warning-triangle-o",
                    "count": (clusterCountData.warning_alerts ? clusterCountData.warning_alerts : 0),
                }, {
                    "iconClass": "pficon pficon-flag",
                    "count": 0,
                    "text": " Cluster have lost quorum"
                }]
            };
        }

        function clusterHost(clusterData) {
            var hostData = clusterData.hosts_count;
            vm.hostStatus = {
                "title": "Hosts",
                "count": hostData.total,
                "notifications": []
            };

            if (!hostData.down && !hostData.crit_alert_count && !hostData.warn_alert_count) {
                vm.hostStatus.notifications.push({
                    "iconClass": "pficon pficon-ok"
                });
            } else {
                if (hostData.crit_alert_count) {
                    vm.hostStatus.notifications.push({
                        "iconClass": "pficon pficon-error-circle-o",
                        "count": (hostData.crit_alert_count ? hostData.crit_alert_count : 0)
                    });
                }
                if (hostData.warn_alert_count) {
                    vm.hostStatus.notifications.push({
                        "iconClass": "pficon pficon-warning-triangle-o",
                        "count": (hostData.warn_alert_count ? hostData.warn_alert_count : 0)
                    });
                }
                if (hostData.down) {
                    vm.hostStatus.notifications.push({
                        "iconClass": "fa fa-arrow-circle-o-down",
                        "count": (hostData.down ? hostData.down : 0)
                    });
                }
            }
        }

        function clusterMon() {
            var monData = vm.cephCluster.sds_det.mon_status_wise_counts;
            vm.monStatus = {
                "title": "Monitors",
                "count": monData.total,
                "notifications": []
            };

            if (!monData.outside_quorum) {
                vm.monStatus.notifications.push({
                    "iconClass": "pficon pficon-ok"
                })
            } else {
                if (monData.outside_quorum) {
                    vm.monStatus.notifications.push({
                        "iconClass": "pficon pficon-flag",
                        "count": (monData.outside_quorum ? monData.outside_quorum : 0)
                    })
                }
            }
        }

        function clusterPG(pgOverview) {
            var PGData = pgOverview,
            pgTotal = PGData.warn ? PGData.warn : 0 + PGData.critical ? PGData.critical : 0 + PGData.ok ? PGData.ok : 0;
            vm.PGStatus = {
                "title": "PGs",
                "count": pgTotal,
                "notifications": []
            };

            if (pgTotal === PGData.ok || !pgTotal) {
                vm.PGStatus.notifications.push({
                    "iconClass": "pficon pficon-ok"
                })
            } else {
                if (PGData.critical) {
                    vm.PGStatus.notifications.push({
                        "iconClass": "pficon pficon-error-circle-o",
                        "count": (PGData.critical ? PGData.critical : 0)
                    });
                }
                if (PGData.warn) {
                    vm.PGStatus.notifications.push({
                        "iconClass": "pficon pficon-warning-triangle-o",
                        "count": (PGData.warn ? PGData.warn : 0)
                    });
                }
            }
        }

        function clusterOsd() {
            var osdData = vm.cephCluster.sds_det.osd_status_wise_counts;
            vm.osdStatus = {
                "title": "OSDs",
                "count": osdData.total,
                "notifications": []
            };

            if (!osdData.down) {
                vm.osdStatus.notifications.push({
                    "iconClass": "pficon pficon-ok"
                })
            } else {
                if (osdData.down) {
                    vm.osdStatus.notifications.push({
                        "iconClass": "fa fa-arrow-circle-o-down",
                        "count": (osdData.down ? osdData.down : 0)
                    })
                }
            }
        }

        function rawStorageUtilization(clusterData) {
            vm.rawStorageUtilizationCustChartHeight = 60;
            vm.rawStorageUtilizationCenterLabel = "percent";

            if (rawStorageUtilizationXData.length > 2) {
                checkTime = dashboardStore.convertTime(vm.chartData[vm.chartData.length - 1][1]) > rawStorageUtilizationXData[rawStorageUtilizationXData.length - 1];
                if (checkTime) {
                    rawStorageUtilizationYData.splice(1, 1);
                    rawStorageUtilizationXData.splice(1, 1);
                }
            }

            vm.rawStorageUtilizationConfig = {
                title: "Raw Storage Utilization",
                units: "GB"
            };

            vm.rawStorageUtilizationDonutConfig = {
                chartId: "glusterStorage",
                thresholds: { "warning": "60", "error": "90" }
            };

            vm.rawStorageUtilizationSparklineConfig = {
                'chartId': "glusterStorageSparkline",
                'tooltipType': "percent",
                'units': "GB"
            };

            for (var i = rawStorageUtilizationXData.length - 1; i < vm.chartData.length; i++) {
                rawStorageUtilizationXData.push(dashboardStore.convertTime(vm.chartData[i][1]));
                rawStorageUtilizationYData.push(vm.chartData[i][0].toFixed(2));
            }

            function checkDonutDataAvailable() {
                return clusterData.utilization && clusterData.utilization.percent_used ? true : false;
            }

            vm.rawStorageUtilizationData = {
                dataAvailable: checkDonutDataAvailable(),
                used: (clusterData.utilization.used / Math.pow(1024, 3)).toFixed(2),
                total: (clusterData.utilization.total / Math.pow(1024, 3)).toFixed(2),
                xData: rawStorageUtilizationXData,
                yData: rawStorageUtilizationYData
            };
        }

        function defaultSystemPerformanceSettings(node_summaries) {
            vm.heatMapdataAvailable = node_summaries ? true : false;
            vm.heatmapTitle = "System Performance";
            vm.legendLabels = ["< 60%", "70%", "70-80%", "80-90%", "> 90%"];
            vm.thresholds = [.6, .7, .8, .9];
            vm.heatmapColorPattern = ["#d4f0fa", "#F9D67A", "#EC7A08", "#CE0000", "#f00"];
            vm.showLegends = false;
            vm.systemPerformanceLegends = true;
        }

        function poolChartTitleData(poolOverview) {
            return {
                "title": poolOverview.total === 1 ? "Pool" : "Pools",
                "data": {
                    "total": poolOverview.total ? poolOverview.total :vm.cephCluster.sds_det.most_used_pools.length,
                    "error": poolOverview.critical_alerts,
                    "warning": poolOverview.warning_alerts
                }
            }
        }

        function rbdChartTitleData(rbdOverview) {
            return {
                "title": rbdOverview.total === 1 ? "RBD" : "RBDs",
                "data": {
                    "total": rbdOverview.total ? rbdOverview.total :vm.cephCluster.sds_det.most_used_rbds.length,
                    "error": rbdOverview.critical_alerts,
                    "warning": rbdOverview.warning_alerts
                }
            }
        }

        function poolBarChartData() {
            var mostUsedPools = [],
                poolList = vm.cephCluster.sds_det.most_used_pools;
            for (var i = 0; i < poolList.length; i++) {
                var poolData = {
                    "title": poolList[i].cluster_name + " : " + poolList[i].pool_name,
                    "data": {
                        "used": poolList[i].percent_used,
                        "total": "100"
                    }
                }
                mostUsedPools.push(poolData);
            }
            return mostUsedPools;
        }

        function rbdBarChartData() {
            var mostUsedRbds = [],
                rbdsList = vm.cephCluster.sds_det.most_used_rbds,
                rbdsListLen = rbdsList.length;
            for (var i = 0; i < rbdsListLen; i++) {
                var rbdData = {
                    "title": rbdsList[i].cluster_name + " : " + rbdsList[i].name,
                    "data": {
                        "used": rbdsList[i].used,
                        "total": rbdsList[i].provisioned
                    }
                }
                mostUsedRbds.push(rbdData);
            }
            return mostUsedRbds;
        }

        function trendChartData(){
            vm.iopsConfig = {
                "chartId": "iopsTrendsChart",
                "layout": "small",
                "trendLabel": "Virtual Disk I/O",
                "units": "K",
                "title": "IOPS",
                "timeFrame": "Last 24 hours"
            };

            vm.latencyConfig = {
                "chartId": "latencyTrendsChart",
                "layout": "small",
                "trendLabel": "Physical Disk I/O",
                "units": "ms",
                "title": "Latency",
                "timeFrame": "Last 24 hours"
            };

            vm.publicNetworkConfig = {
                "chartId": "virtualTrendsChart",
                "layout": "small",
                "trendLabel": "Virtual Disk I/O",
                "units": "KBps",
                "title": "Public Network",
                "timeFrame": "Last 24 hours"
            };

            vm.clusterNetworkConfig = {
                "chartId": "physicalTrendsChart",
                "layout": "small",
                "trendLabel": "Physical Disk I/O",
                "units": "KBps",
                "title": "Cluster Network",
                "timeFrame": "Last 24 hours"
            };
        }
    }
}());
