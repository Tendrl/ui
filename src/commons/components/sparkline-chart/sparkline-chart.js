/*
    ============= How to use "sparklineChart" directive ======

    - chartId:  Expected "unique number" for each chart in one template.
                For example: if you are using ng-repeat .
                inside ng-repeat -
                <div ng-repeat="host in hostList"
                    <sparkline-chart chart-id="{{$index}}">
                    </sparkline-chart>
                </div>

                NOTE: "c3" (plugin used for draw chart) expect unique id for each chart to draw

    - chartData: Should be one array with used value with their corresponding timestamp. Example =>
        [["usedValue1","timestamp1"],["usedValue2","timestamp2"],["usedValue3","timestamp3"]]
        
        (In your controller):
        vm.chartData = [
                [10, 1311836001],
                [20, 1311836002],
                [30, 1311836003],
                [20, 1311836004],
                [30, 1311836005],
                [10, 1311836006]
        ]

        (In your template):
        <div ng-repeat="host in hostList"
            <sparkline-chart chart-id="{{$index}}" chart-data="chartData">
            </sparkline-chart>
        </div>

        NOTE: if your "vm.chartData" is empty array. than automatically "sparkline chart" will show "no data available".
*/

(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("sparklineChart", sparklineChart);

    function sparklineChart() {

        return  {
                restrict: "E",

                scope: {
                    chartId: "@",
                    chartData: "="
                },

                replace: false,

                controller: function($scope, config) {

                    /* initialization for default parameters */
                    $scope.custShowXAxis = false;
                    $scope.custShowYAxis = false;
                    $scope.custChartHeight = 50;
                    $scope.chartConfig = {
                        chartId: "sparkline-chart-" + $scope.chartId,
                        tooltipType: 'default'
                    };

                    $scope.setGraphData = function() {
                        var times = ["dates"], used = ["used"], isDataAvailable = false;
                        if($scope.chartData.length !== 0 ) {
                            isDataAvailable = true;
                            for (var index in $scope.chartData) {
                              var dataWithTimestamp = $scope.chartData[index];
                              times.push(new Date(dataWithTimestamp[1]));
                              used.push(dataWithTimestamp[0].toFixed(1));
                            }
                        }
                        $scope.chartMainData = {
                            dataAvailable: isDataAvailable,
                            xData: times,
                            yData: used
                        }
                    }

                    $scope.setGraphData();
                    
                },

                templateUrl: "/commons/components/sparkline-chart/sparkline-chart.html"
        }
    }

}());