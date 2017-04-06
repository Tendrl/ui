(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("dashboardController", dashboardController);

    /*@ngInject*/
    function dashboardController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this;
        vm.chartData = [];

        vm.barChartTitleData = null;
        vm.barChartData = [];
        vm.horizontalBarChartData = [];
        vm.heatMapdataAvailable = false;

        init();

        function init() {
            utils.getObjectList("trends-chart")
                .then(function(data) {
                    vm.chartData = data[0].datapoints;
                });
            utils.getObjectList("bar-chart")
                .then(function(data) {
                    vm.barChartTitleData = data.chartTitleData;
                    vm.barChartData = data.chartData;
                    vm.horizontalBarChartData = data.horizontalBarChartData;
                });
            utils.getObjectList("heat-map")
                .then(function(data) {
                    vm.heatMapData = data;
                    vm.heatMapdataAvailable = true;
                });

        }

        vm.IOPSConfig = {
            "chartId": "IOPSTrendsChart",
            "layout": "small",
            "units": "K",
            "tooltipType": "actual",
          }
        var today = new Date();
        var dates = ["dates"];
        for (var d = 20 - 1; d >= 0; d--) {
            dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
        }

        vm.heatmapTitle = "System Performance";

        vm.legendLabels = ["< 60%","70%", "70-80%" ,"80-90%", "> 90%"];
        vm.rangeTooltips = ["Memory Utilization < 70%<br\>40 Nodes", "Memory Utilization 70-80%<br\>4 Nodes", "Memory Utilization 80-90%<br\>4 Nodes", "Memory Utilization > 90%<br\>4 Nodes"];
        vm.thresholds = [0.6, 0.7, 0.8, 0.9];
        vm.heatmapColorPattern = ["#d4f0fa", "#F9D67A", "#EC7A08", "#CE0000", "#f00"];
        vm.showLegends = false;
        vm.systemPerformanceLegends = true;

        vm.configVirtual = {
            "chartId": "virtualTrendsChart",
            "layout": "small",
            "trendLabel": "Virtual Disk I/O",
            "units": "GB",
            "tooltipType": "percentage",
            "title": "IOPS",
            "timeFrame": "Last 24 hours"
        };

        vm.latencyConfig = {
            "chartId": "LatencyTrendsChart",
            "layout": "small",
            "units": "ms",
            "tooltipType": "actual",
          }

        vm.configPhysical = {
            "chartId": "physicalTrendsChart",
            "layout": "small",
            "trendLabel": "Physical Disk I/O",
            "units": "MHz",
            "tooltipType": "percentage",
            "title": "Latency",
            "timeFrame": "Last 24 hours"
        };

        vm.status = {
           "title":"Cluster",
           "count":5,
           "href":"#",
           "notifications":[
            {
                "iconClass":"fa fa-arrow-circle-o-down",
                "count":1,
                "href":"#"
            },
            {
                "iconClass":"pficon  pficon-resources-almost-full",
                "count":1,
                "href":"#"
            },
            {
                "iconClass":"pficon pficon-error-circle-o",
                "count":4,
                "href":"#"
            },
            {
                "iconClass":"pficon pficon-warning-triangle-o",
                "count":1
            },
            {
                "iconClass":"pficon pficon-flag",
                "count":1,
                "text": "Cluster have host quorum"
            }

           ]
        };
    }

})();
