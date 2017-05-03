 (function() {
  "use strict";

  var app = angular.module("TendrlModule");

  app.controller("cephDashboardController", cephDashboardController);

  app.component("cephDashboard", {
    bindings: {
      cephCluster: "<",
      chartData: "=?",
      showClusterData: "=?",
    },
    controller: "cephDashboardController",
    controllerAs: "vm",
    templateUrl: "/commons/components/ceph-dashboard/ceph-dashboard.html"
  });

  function cephDashboardController($scope, $rootScope, dashboardStore){
    var vm = this,
    i,
    rawStorageUtilizationXData = ["percent"],
    rawStorageUtilizationYData = ["used"];

    vm.$onChanges = function(changesObj){
        if(vm.showClusterData){
            clusterData(vm.cephCluster);
        }
        clusterHost(vm.cephCluster);
        clusterMon();
        clusterOsd();
        vm.poolBarChartTitleData = poolChartTitleData();
        vm.poolBarChartData = poolBarChartData();
        vm.rbdBarChartTitleData = rbdChartTitleData();
        vm.rbdBarChartData = rbdBarChartData();
        rawStorageUtilization(vm.cephCluster);
    };

    function clusterData(clusterData){
        var clusterCountData = clusterData.cluster_count,
        downClusters = clusterCountData.status.total -
                    (clusterCountData.status.HEALTH_OK ? clusterCountData.status.HEALTH_OK : 0 +
                    clusterCountData.status.HEALTH_WARN ? clusterCountData.status.HEALTH_WARN : 0 +
                    clusterCountData.status.healthy ? clusterCountData.status.healthy : 0);

        vm.clusterStatus = {
           "title":"Cluster",
           "count": clusterCountData.status.total ? clusterCountData.status.total : 0,
           // "href":"#",
           "notifications":[
            {
                "iconClass":"fa fa-arrow-circle-o-down",
                "count": downClusters,
                // "href":"#"
            },
            {
                "iconClass":"pficon  pficon-resources-almost-full",
                "count": (clusterCountData.near_full ? clusterCountData.near_full : 0),
                // "href":"#"
            },
            {
                "iconClass":"pficon pficon-error-circle-o",
                "count":(clusterCountData.critical_alerts ? clusterCountData.critical_alerts : 0),
                // "href":"#"
            },
            {
                "iconClass":"pficon pficon-warning-triangle-o",
                "count":(clusterCountData.warning_alerts ? clusterCountData.warning_alerts  : 0),
            },
            {
                "iconClass":"pficon pficon-flag",
                "count": 0,
                "text": " Cluster have host quorum"
            }]
        };
    }

    function clusterHost(clusterData){
        var hostData = clusterData.hosts_count;
        vm.hostStatus = {
        "title":"Hosts",
        "count": hostData.total,
        // "href":"#",
        "notifications":[
        ]};

        if(!hostData.down && !hostData.crit_alert_count && !hostData.warn_alert_count){
            vm.hostStatus.notifications.push({
                "iconClass":"pficon pficon-ok"
            });
        } else {
            if(hostData.crit_alert_count){
                vm.hostStatus.notifications.push({
                    "iconClass":"pficon pficon-error-circle-o",
                    "count": (hostData.crit_alert_count ? hostData.crit_alert_count : 0)
                });
            }
            if(hostData.warn_alert_count){
                vm.hostStatus.notifications.push({
                    "iconClass":"pficon pficon-warning-triangle-o",
                    "count": (hostData.warn_alert_count ? hostData.warn_alert_count : 0)
                });
            }
            if(hostData.down){
                vm.hostStatus.notifications.push({
                    "iconClass":"fa fa-arrow-circle-o-down",
                    "count": (hostData.down ? hostData.down : 0)
                });
            }
        }
    }

    function clusterMon(){
	    var monData = vm.cephCluster.sds_det.mon_counts;
	    vm.monStatus = {
	    "title":"Monitors",
	    "count": monData.total,
	    "href":"#",
	    "notifications":[
	    ]};

	    if(!monData.outside_quorum){
	        vm.monStatus.notifications.push({
	            "iconClass":"pficon pficon-ok"
	        })
	    } else {
	        if(monData.outside_quorum){
	            vm.monStatus.notifications.push({
	                "iconClass":"pficon pficon-flag",
	                "count": (monData.outside_quorum ? monData.outside_quorum : 0)
	            })
	        }
	    }
	}

	function clusterOsd(){
        var osdData = vm.cephCluster.sds_det.osd_counts;
        vm.osdStatus = {
        "title":"OSDs",
        "count": osdData.total,
        "href":"#",
        "notifications":[
        ]};

        if(!osdData.down){
            vm.osdStatus.notifications.push({
                "iconClass":"pficon pficon-ok"
            })
        } else {
            if(osdData.down){
                vm.osdStatus.notifications.push({
                    "iconClass":"fa fa-arrow-circle-o-down",
                    "count": (osdData.down ? osdData.down : 0)
                })
            }
        }
    }

    function rawStorageUtilization(clusterData){
        var checkTime
        if(rawStorageUtilizationXData.length > 2){
            checkTime = dashboardStore.convertTime(vm.chartData[vm.chartData.length - 1][1]) > rawStorageUtilizationXData[rawStorageUtilizationXData.length -1];
            if(checkTime){
                rawStorageUtilizationYData.splice(1, 1);
                rawStorageUtilizationXData.splice(1, 1);
            }
        }
        vm.rawStorageUtilizationConfig = {
            title: "Memory",
            units: "GB"
        };

        vm.rawStorageUtilizationDonutConfig = {
            chartId: "glusterStorage",
            thresholds: {"warning":"60","error":"90"}
        };

        vm.rawStorageUtilizationSparklineConfig = {
            'chartId': "glusterStorageSparkline",
            'tooltipType': "percent",
            'units': "GB"
        };

        for(var i = rawStorageUtilizationXData.length - 1; i < vm.chartData.length; i++){
            rawStorageUtilizationXData.push(dashboardStore.convertTime(vm.chartData[i][1]));
            rawStorageUtilizationYData.push(vm.chartData[i][0].toFixed(2));
        }

        function checkDonutDataAvailable(){
            return clusterData.utilization && clusterData.utilization.percent_used ? true : false;
        }

        vm.rawStorageUtilizationData = {
            dataAvailable: checkDonutDataAvailable(),
            used: (clusterData.utilization.used / Math.pow(1024,3)).toFixed(0),
            total: (clusterData.utilization.total / Math.pow(1024,3)).toFixed(0),
            xData: rawStorageUtilizationXData,
            yData: rawStorageUtilizationYData
        };
        vm.rawStorageUtilizationCustChartHeight = 60;
        vm.rawStorageUtilizationCenterLabel = "percent";
    }

    function poolChartTitleData(){
        return {
          "title": vm.cephCluster.sds_det.most_used_pools.length === 1 ? "Pool" : "Pools",
          "data": {
              "total" : vm.cephCluster.sds_det.most_used_pools.length,
              "error" : 0,
              "warning" : 0
            }
        }
    }

    function rbdChartTitleData(){
        return {
          "title": vm.cephCluster.sds_det.most_used_rbds.length === 1 ? "RBD" : "RBDs",
          "data": {
              "total" : vm.cephCluster.sds_det.most_used_rbds.length,
              "error" : 0,
              "warning" : 0
            }
        }
    }

    function poolBarChartData(){
        var mostUsedPools = [],
        poolList = vm.cephCluster.sds_det.most_used_pools;
        for(var i = 0; i < poolList.length; i++){
            var poolData = {
              "title" : poolList[i].cluster_name + " : " + poolList[i].pool_name,
              "data" : {
                  "used": poolList[i].percent_used,
                  "total": "100"
                }
            }
            mostUsedPools.push(poolData);
        }
        return mostUsedPools;
    }

    function rbdBarChartData(){
        var mostUsedRbds = [],
        rbdsList = vm.cephCluster.sds_det.most_used_rbds,
        rbdsListLen = rbdsList.length;
        for(var i = 0; i < rbdsListLen; i++){
            var rbdData = {
              "title" : rbdsList[i].cluster_name + " : " + rbdsList[i].name,
              "data" : {
                  "used": rbdsList[i].used,
                  "total": rbdsList[i].provisioned
                }
            }
            mostUsedRbds.push(rbdData);
        }
        return mostUsedRbds;
    }
  }
}());
