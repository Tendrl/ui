(function() {
  "use strict";

  var app = angular.module("TendrlModule");

  app.controller("glusterDashboardController", glusterDashboardController);

  app.component("glusterDashboard", {
    bindings: {
      glusterCluster: "<",
      chartData: "=?",
      alerts: "=?",
      volumeOverview: "=?",
      brickOverview: "=?",
      showClusterData: "=?",
      showPerformanceData: "=?",
      showHeatMapData: "=?",
    },
    controller: "glusterDashboardController",
    controllerAs: "vm",
    templateUrl: "/commons/components/gluster-dashboard/gluster-dashboard.html"
  });

  function glusterDashboardController($scope, $rootScope, utils){
    var vm = this,
    i,
    rawStorageUtilizationXData = ["percent"],
    rawStorageUtilizationYData = ["used"];

    vm.$onChanges = function(changesObj){
        if(vm.showClusterData){
            clusterData(vm.glusterCluster);
        }
        clusterHost(vm.glusterCluster);
        clusterClients(vm.glusterCluster);
        vm.fileshareChartTitleData = fileshareChartTitleData(vm.volumeOverview);
        vm.fileShareChartData = fileShareChartData();
        vm.bricksTitleData = bricksTitleData(vm.brickOverview);
        vm.bricksChartData = bricksChartData();
        rawStorageUtilization(vm.glusterCluster);
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

    function clusterClients(clusterData){
        vm.clientStatus = {
        "title":"Clients",
        "count":  clusterData.sds_det.connection_active ? clusterData.sds_det.connection_active : 0,
        "notifications":[
            {
                "iconClass":"pficon pficon-ok"
            }
        ]};
    }

    function rawStorageUtilization(clusterData){
        var checkTime
        if(rawStorageUtilizationXData.length > 2){
            checkTime = convertTime(vm.chartData[vm.chartData.length - 1][1]) > rawStorageUtilizationXData[rawStorageUtilizationXData.length -1];
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
            rawStorageUtilizationXData.push(convertTime(vm.chartData[i][1]));
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

    function convertTime(epocTime){
        var utcSeconds = epocTime,
        d = new Date(0);
        d.setUTCSeconds(utcSeconds);
        return d;
    }

    function fileshareChartTitleData(volumeOverview){
        var volData = volumeOverview;
        return {
          "title": volData.total === 1 ? "File Share" : "File Shares",
          "data": {
              "total" : volData.total,
              "error" : volData.critical_alerts,
              "warning" : volData.warning_alerts
            }
        }
    }

    function fileShareChartData(){
        var mostUsedFileShare = [],
        fileShareList = vm.glusterCluster.sds_det.most_used_volumes,
        fileShareData,
        i;
        for(i = 0; i < fileShareList.length; i++){
            fileShareData = {
              "title" :  fileShareList[i].name,
              "data" : {
                  "used": fileShareList[i].used_capacity,
                  "total": fileShareList[i].usable_capacity
                }
            }
            mostUsedFileShare.push(fileShareData);
        }
        return mostUsedFileShare;
    }

    function bricksTitleData(brickOverview){
        var brickData = brickOverview;
        return {
          "title": brickOverview.total === 1 ? "Brick" : "Bricks",
          "data": {
              "total" : brickData.total,
              "error" : brickData.critical_alerts,
              "warning" : brickData.warning_alerts
            }
        }
    }

    function bricksChartData(){
        var mostUsedBricks = [],
            bricksList,
            brickData,
            bricksListLen,
            i,
            used,
            total;
        if(vm.glusterCluster.sds_det.most_used_bricks){
            bricksList = vm.glusterCluster.sds_det.most_used_bricks;
            bricksListLen = bricksList.length;
            for(i = 0; i < bricksListLen; i++){
                used = utils.convertToBytes(bricksList[i].used,"GB");
                total = utils.convertToBytes(bricksList[i].total,"GB");
                brickData = {
                  "title" :  bricksList[i].brick_path,
                  "data" : {
                      "used": used,
                      "total": total
                    }
                }
                mostUsedBricks.push(brickData);
            }
        }
        return mostUsedBricks;
    }
  }
}());
