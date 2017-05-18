
(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("dashboardStore", dashboardStore);

    /*@ngInject*/
    function dashboardStore($state, $q, utils, $filter, config, $http) {
        var store = this,
            hostUtilization;

        store.getClusterDashboardList = function(cluster_id, componentType) {
            var list,
                deferred;

            deferred = $q.defer();

            utils.getClusterDashboardList(cluster_id, componentType)
                .then(function(data) {
                    list = data.stats ? data.stats : [];
                    deferred.resolve(list);
                });

            return deferred.promise;
        };

        store.getClusterDashboardUtilizationList = function(id, componentType, type) {
            var list,
                deferred;

            deferred = $q.defer();
            utils.getClusterDashboardList(id, componentType, type)
                .then(function(data) {
                    list = data && data.stats[0] && data.stats[0].datapoints ? data.stats[0].datapoints : [];
                    deferred.resolve(list);
                });

            return deferred.promise;
        };

        store.getHostUtilizationList = function(id, componentType, type) {
            var list = {},
                deferred;

            deferred = $q.defer();
            utils.getClusterDashboardList(id, componentType, type)
                .then(function(data) {
                    list[type] = data && data.stats[0] && data.stats[0].datapoints ? data.stats[0].datapoints : [];
                    deferred.resolve(list);
                });

            return deferred.promise;
        };

        store.filterAlerts = function(alerts, clusterType) {
            var i,
                alertsLen = alerts.length,
                clusterAlerts = [];

            for (i = 0; i < alertsLen; i++) {
                if (alerts[i].sdsName && alerts[i].sdsName === clusterType) {
                    clusterAlerts.push(alerts[i]);
                }
            }
            return clusterAlerts;
        }


        store.convertTime = function(epocTime) {
            var utcSeconds = epocTime,
                d = new Date(0);
            d.setUTCSeconds(utcSeconds);
            return d;
        }


        store.systemPerformance = function(node_summaries) {
            var i,
                cpuUsage,
                cpuHeatMapData = [],
                storageUsage,
                storageHeatMapData = [],
                systemPerformanceData = [];

            for (i = 0; i < node_summaries.length; i++) {
                cpuUsage = {};
                storageUsage = {};

                cpuUsage.id = i;
                cpuUsage.value = node_summaries[i].cpu_usage.percent_used / 100;
                cpuUsage.tooltip = node_summaries[i].name + " " +
                    node_summaries[i].cpu_usage.percent_used + "%";

                cpuHeatMapData.push(cpuUsage);

                storageUsage.id = i;
                storageUsage.value = node_summaries[i].memory_usage.percent_used / 100;
                storageUsage.tooltip = node_summaries[i].name + " " +
                    node_summaries[i].memory_usage.percent_used + "%";

                storageHeatMapData.push(storageUsage);
            }
            systemPerformanceData.push({
                title: "CPU",
                data: cpuHeatMapData
            }, {
                title: "Storage",
                data: storageHeatMapData
            });

            return systemPerformanceData;
        }

        store.createDashboardUrl = function(id, componentType, type) {
            var url, getClusterDashboardListRequest, request;
            if (type === "public_network" || type === "cluster_network") {
                url = config.baseUrl + "monitoring/" + componentType + "/" + id + "/throughput?type=" + type;
            } else if (type) {
                url = config.baseUrl + "monitoring/" + componentType + "/" + id + "/" + type;
            } else {
                url = config.baseUrl + "monitoring/" + componentType + "/" + id;
            }
            return url;
        }

        store.generateHostDetailUrl = function(endpoint) {
            return $http({ method: 'GET', url: endpoint });
        }

        store.getHostDetailData = function(hostPageUtilization){
            var list,
            deferred = $q.defer();

            $q.all([hostPageUtilization.memory,
                hostPageUtilization.swap,
                hostPageUtilization.cluster_network,
                hostPageUtilization.public_network,
                hostPageUtilization.iops,
                hostPageUtilization.storage,
                hostPageUtilization.cpu])
            .then(function(data) {
                list = data;
                deferred.resolve(list);
            }, function (e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching HostDetailUtilization");
                return null;
            })
            return deferred.promise;
        }
    }
})();
