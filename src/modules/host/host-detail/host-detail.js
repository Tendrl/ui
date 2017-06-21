(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("hostDetailController", hostDetailController);

    /*@ngInject*/
    function hostDetailController($state, $stateParams, utils, $scope, $rootScope, nodeStore, $interval, dashboardStore, config, $q, $filter) {

        var vm = this,
            hostDetailTimer,
            alerts,
            hostEndpoints = [
                "memory",
                "swap",
                "cluster_network",
                "public_network",
                "iops",
                "storage",
                "cpu"
            ],
            hostUtilizationXData = {},
            hostUtilizationYData = {},
            hostObj;

        vm.tabList = {
            "Overview": 1,
        };
        vm.setTab = setTab;
        vm.isTabSet = isTabSet;
        vm.isDataLoading = true;
        vm.hostOverviewDataNotFound = false;
        vm.activeTab = vm.tabList["Overview"];
        vm.utilization = {};
        vm.hostDataAvailable = false;
        vm.hostPageUtilization = {};
        vm.hostUtilizationCustChartHeight = {};
        vm.hostUtilizationCenterLabel = {};
        vm.hostUtilizationConfig = {};
        vm.hostUtilizationDonutConfig = {};
        vm.hostUtilizationSparklineConfig = {};
        vm.hostUtilizationData = {};

        init();
        /* Adding clusterId in scope so that it will be accessible inside child directive */
        function init() {
            $scope.hostId = $stateParams.hostId;
            if (!$rootScope.clusterData) {
                utils.getObjectList("Cluster")
                    .then(function(data) {
                        $rootScope.clusterData = data;
                        _setHostDetail();
                    });
            } else {
                _setHostDetail();
            }
        }

        function _setHostDetail() {
            nodeStore.getNodeList()
                .then(function(hostList) {
                    hostObj = nodeStore.filterNodeList(hostList, $scope.hostId);
                    vm.hostDataAvailable = true;
                    vm.hostName = hostObj.fqdn || "NA";
                    vm.hostStatus = hostObj.status;
                    _summaryHostDetail(hostObj);
                    _tabsHostDetail(hostObj.tendrlcontext.sds_name);
                    _hostSpecificData($scope.hostId);
                    startTimer();
                });
        }

        function _tabsHostDetail(sdsName) {
            vm.sdsName = sdsName;
            if (sdsName === "gluster") {
                // vm.tabList.Bricks = 2;
                // vm.tabList.Configration = 3;
            } else {
                // vm.tabList.OSDs = 2;
                // vm.tabList.Configration = 3;
            }
        }

        function _summaryHostDetail(hostObj) {
            vm.summaryHost = [];
            vm.summaryHost.push(["Name", hostObj.fqdn]);
            vm.summaryHost.push(["Status", hostObj.status + " Since " + hostObj.updated_at]);
            vm.summaryHost.push(["Cluster", hostObj.tendrlcontext.cluster_name || "NA"]);
            vm.summaryHost.push(["Role", nodeStore.findRole(hostObj.tags)]);
            vm.summaryHost.push(["SELinux", hostObj.os.selinux_mode]);
        }

        function _hostSpecificData(hostId) {
            var i,
                hostEndpointsLen = hostEndpoints.length,
                url,
                hostUtilizationData;

            for (i = 0; i < hostEndpointsLen; i++) {
                url = dashboardStore.createDashboardUrl(hostId, "node", hostEndpoints[i]);
                vm.hostPageUtilization[hostEndpoints[i]] = dashboardStore.generateHostDetailUrl(url);
            }

            dashboardStore.getHostDetailData(vm.hostPageUtilization)
                .then(function(hostUtilizationData) {
                    if(hostUtilizationData !== null){
                        _hostUtilizationTrend(returnStats(hostUtilizationData[6].data), "cpu");
                        _hostUtilizationTrend(returnStats(hostUtilizationData[0].data), "memory");
                        _hostUtilizationTrend(returnStats(hostUtilizationData[1].data), "swap");
                        _hostUtilizationTrend(returnStats(hostUtilizationData[5].data), "storage");
                        _hostTrendChartData();
                        vm.hostClusterNetwork = returnStats(hostUtilizationData[2].data);
                        vm.hostPublicNetwork = returnStats(hostUtilizationData[3].data);
                        vm.hostIops = returnStats(hostUtilizationData[4].data);
                        vm.isDataLoading = false;
                    } else {
                        vm.hostOverviewDataNotFound = true;
                        vm.isDataLoading = false;
                    }
                });
        }

        function returnStats(data) {
            return data && data.stats[0] && data.stats[0].datapoints ? data.stats[0].datapoints : [];
        }

        function _hostUtilizationTrend(componentData, title) {
            var checkTime,
                lastPreviousTime,
                lastCurrentTime,
                i,
                utilizationDataLen = componentData.length;

            hostUtilizationXData[title] = ["percent"];
            hostUtilizationYData[title] = ["used"];

            if (hostUtilizationXData[title].length > 2) {
                lastPreviousTime = hostUtilizationXData[title][hostUtilizationXData[title].length - 1];
                lastCurrentTime = dashboardStore.convertTime(componentData[componentData.length - 1][1]);
                checkTime = lastCurrentTime > lastPreviousTime;
                if (checkTime) {
                    hostUtilizationYData[title].splice(1, 1);
                    hostUtilizationXData[title].splice(1, 1);
                }
            }

            for (i = hostUtilizationXData[title].length - 1; i < utilizationDataLen; i++) {
                if (componentData[i][0] !== null && componentData[i][1] !== null) {
                    hostUtilizationXData[title].push(dashboardStore.convertTime(componentData[i][1]));
                    hostUtilizationYData[title].push(componentData[i][0]);
                }
            }

            vm.hostUtilizationCustChartHeight[title] = 60;
            vm.hostUtilizationCenterLabel[title] = "percent";

            vm.hostUtilizationConfig[title] = {
                title: $filter("uppercase")(title),
                units: "%"
            };

            vm.hostUtilizationDonutConfig[title] = {
                chartId: title + "-utilization",
                thresholds: { "warning": "60", "error": "90" }
            };

            vm.hostUtilizationSparklineConfig[title] = {
                "chartId": title + "-Sparkline",
                "tooltipType": "percentage",
                "units": "%"
            };

            function checkDonutDataAvailable() {
                return hostUtilizationXData[title].length > 1 && hostUtilizationYData[title].length > 1 ? true : false;
            }

            function usedHostUtilizationData() {
                if (componentData.length) {
                    return parseInt(componentData[componentData.length - 1][0]);
                }
                return 0;
            }

            vm.hostUtilizationData[title] = {
                dataAvailable: checkDonutDataAvailable(),
                used: usedHostUtilizationData(),
                total: 100,
                xData: hostUtilizationXData[title],
                yData: hostUtilizationYData[title]
            };
        }

        function startTimer() {
            hostDetailTimer = $interval(function() {
                init();
            }, 1000 * config.dashboardIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostDetailTimer);
        });

        function setTab(newTab) {
            vm.activeTab = newTab;
        }

        function isTabSet(tabNum) {
            return vm.activeTab === tabNum;
        }

        function _hostTrendChartData() {
            vm.iopsConfig = {
                "chartId": "hostIopsTrendsChart",
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

})();
