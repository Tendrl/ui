/*
    /**
 * @ngdoc directive
 * @name trendsChart
 *
 * @description
 *   Directive for rendering a trend chart. The trend chart combines overall data with a
 *   pfSparklineChart.
 *   <br><br>
 *   See http://c3js.org/reference.html for a full list of C3 chart options.<br>
 *   See also: {@link patternfly.charts.directive:pfSparklineChart}
 *
 * @param {object} config configuration settings for the trends chart:<br/>
 * <ul style="list-style-type: none">
 * <li>.chartId    - the unique id of this trends chart
 * <li>.title      - (optional) title of the Trends chart
 * <li>.layout     - (optional) the layout and sizes of titles and chart. Values are "large" (default), "small", "compact", and "inline"
 * <li>.trendLabel - (optional) the trend label used in the "inline" layout
 * <li>.timeFrame  - (optional) the time frame for the data in the pfSparklineChart, ex: "Last 30 Days"
 * <li>.units      - unit label for values, ex: "MHz","GB", etc..
 * <li>.valueType  - (optional) the format of the latest data point which is shown in the title. Values are "actual"(default) or "percentage"
 * </ul>
 *
 * @param {object} chartData the data to be shown in the sparkline charts<br/>
 * <ul style="list-style-type: none">
 * <li>.total  - number representing the total amount
 * <li>.xData  - Array, X values for the data points, first element must be the name of the data
 * <li>.yData  - Array, Y Values for the data points, first element must be the name of the data
 * <li>.dataAvailable - Flag if there is data available - default: true
 * </ul>
 *
 * @param {int=} chartHeight   height of the sparkline chart
 * @param {boolean=} showXAxis override sparkline config settings for showing the X Axis
 * @param {boolean=} showYAxis override sparkline config settings for showing the Y Axis
 * @example

    In html file -
     <div class="col-md-12">
       <div trends-chart config="config" chart-data="data"
            show-x-axis="custShowXAxis" show-y-axis="custShowYAxis"></div>
     </div>
     
    In js file -
    angular.module( "demo", ["patternfly.charts", "patternfly.card"] ).controller( "ChartCtrl", function( $scope ) {

       $scope.config = {
         chartId      : "exampleTrendsChart",
         title        : "Network Utilization Trends",
         layout       : "large",
         trendLabel   : "Virtual Disk I/O",
         valueType    : "actual",
         timeFrame    : "Last 15 Minutes",
         units        : "MHz",
         tooltipType  : "percentage"
       };

       $scope.footerConfig = {
         iconClass : "fa fa-plus-circle",
         text      : "Add New Cluster",
         callBackFn: function () {
            alert("Footer Callback Fn Called");
          }
       }

       $scope.filterConfig = {
         filters : [{label:"Last 30 Days", value:"30"},
                      {label:"Last 15 Days", value:"15"},
                      {label:"Today", value:"today"}],
         callBackFn: function (f) {
            alert("Filter Callback Fn Called for "" + f.label + "" value = " + f.value);
          }
       }

      var today = new Date();
      var dates = ["dates"];
      for (var d = 20 - 1; d >= 0; d--) {
          dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
      }

       $scope.data = {
           dataAvailable: true,
           total: 250,
           xData: dates,
           yData: ["used", 10, 20, 30, 20, 30, 10, 14, 20, 25, 68, 54, 56, 78, 56, 67, 88, 76, 65, 87, 76]
       };

       $scope.custShowXAxis = false;
       $scope.custShowYAxis = false;

       $scope.addDataPoint = function () {
         $scope.data.xData.push(new Date($scope.data.xData[$scope.data.xData.length - 1].getTime() + (24 * 60 * 60 * 1000)));
         $scope.data.yData.push(Math.round(Math.random() * 100));
       };

       $scope.$watch("valueType", function (newValue) {
         $scope.config.valueType = newValue;
       });

       $scope.$watch("layout", function (newValue) {
         $scope.config.layout = newValue;
       });

     });
 </file>
 </example>
 */

(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("trendsChartController", trendsChartController);

    app.component("trendsChart", {
        bindings: {
            config: "=",
            chartData: "<",
            chartHeight: "=?",
            showXAxis: "=?",
            showYAxis: "=?",
            toolType: "=?"
        },
        controllerAs: "vm",
        controller: "trendsChartController",
        templateUrl: "/commons/components/trends-chart/trends-chart.html"
    });

    function trendsChartController($element, $scope) {
        var vm = this,
            SMALL = 30,
            LARGE = 60,
            cData = {},
            latestValue = 0;
        vm.$onChanges = function(changesObj) {
            setupChartData();

            function setupChartData() {
                cData.total = "100";

                cData.xData = _setupXData();
                cData.yData = _setupYData();
                cData.dataAvailable = vm.chartData.length > 0 ? true : false;

                vm.chartData = cData;
            };
        }

        function _setupXData() {
            var len = vm.chartData.length,
                xData = ["dates"],
                i;

            for (i = 0; i < len; i++) {
                if (vm.chartData[i][1] !== null) {
                    xData.push(vm.chartData[i][1]);
                }
            }

            return xData;
        }

        function _setupYData() {
            var len = vm.chartData.length,
                yData = [vm.toolType],
                i;

            for (i = 0; i < len; i++) {
                if (vm.chartData[i][0] !== null) {
                    yData.push(vm.chartData[i][0]);
                }
            }

            return yData;
        }

        vm.getPercentageValue = function() {
            var pctValue = 0;

            if (vm.chartData.dataAvailable !== false && vm.chartData.total > 0) {
                pctValue = Math.round(vm.getLatestValue() / vm.chartData.total * 100.0);
            }
            return pctValue;
        };

        vm.getLatestValue = function() {
            if (vm.chartData.yData && vm.chartData.yData.length > 0) {
                latestValue = vm.chartData.yData[vm.chartData.yData.length - 1];
            }
            return latestValue;
        };

        vm.getChartHeight = function() {
            var retValue = LARGE;
            if (vm.chartHeight) {
                retValue = vm.chartHeight;
            } else if (vm.config.layout === "small") {
                retValue = SMALL;
            }
            return retValue;
        };

        vm.$postLink = function() {
            $scope.$watch("config", function() {
                vm.showLargeCardLayout = (!vm.config.layout || vm.config.layout === "large");
                vm.showSmallCardLayout = (vm.config.layout === "small");
                vm.showActualValue = (!vm.config.valueType || vm.config.valueType === "actual");
                vm.showPercentageValue = (vm.config.valueType === "percentage");
            }, true);
        };
    }

}());
