/*
    ============= How to use "donutChart" directive ======
            
    - chartTitle (optional):  expected string for title.
        NOTE:-  In UX design some of the place "title" is not there. so it should be optional.

    - chartData: Should be object with three properties - total, used and percent-used
        NOTE: - Here "total" and "used" are optional , But "percent-used" is mandatory property.
        Example: - 

        (In your controller):
        vm.chartData = {"used":352460800,"total":3524608000, "percent-used": 10} (defined chartData object)

        (In your template):
        <div ng-repeat="host in hostList"
            <div  class="col-md-2">
                <div class="list-view-pf-additional-info-item donut-chart" chart-title="Storage" chart-data="node.chartData">
                </div>
            </div>
        </div>

        NOTE: if "vm.chartData.percent-used" is not defined . than automatically "donut chart" will show "no data available".

    - chartThresholds (optional) : if user will not pass thresholds value than it will have default value:
        {'warning':'60','error':'90'} (which is defined in "config.json"- because it should be configurable)
    
        (In your controller):
        vm.chartThresholds = {'warning':'40','error':'90'}; (defined chartThresholds object)

        (In your template):
         <div ng-repeat="host in hostList"
            <div  class="col-md-2">
                <div class="list-view-pf-additional-info-item donut-chart" chart-title="Storage" chart-data="node.chartData" chart-thresholds="chartThresholds">
                </div>
            </div>
        </div>

*/

(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("donutChart", donutChart);

    function donutChart() {

        return  {
                restrict: "C",

                scope: {
                    chartTitle: "@?",
                    chartData: "=",
                    chartThresholds: "=?"
                },

                replace: false,

                link: function(scope, element, attributes) {

                    var c3ChartDefaults = $().c3ChartDefaults();
                    scope.customDonutChartConfig = c3ChartDefaults.getDefaultDonutConfig(scope.chartData["percent-used"]+"%");
                    scope.customDonutChartConfig.size.height = 90;
                    scope.customDonutChartConfig.size.width = 80;
                    scope.customDonutChartConfig.donut.width = 10;
                    scope.customDonutChartConfig.bindto = element[0].childNodes[0]
                    scope.customDonutChartConfig.color =  {
                        pattern: [scope.getThresholdColor(),"#D1D1D1"]
                    };
                    scope.customDonutChartConfig.data = {
                        type: "donut",
                        columns: [
                          [ "Used", scope.used ],
                          ["Available", scope.available ]
                        ],
                        groups: [
                          ["used", "available"]
                        ],
                        order: null
                    };
                    c3.generate(scope.customDonutChartConfig);

                },
                controller: function($scope, config) {

                    if($scope.chartData.total !== undefined && $scope.chartData.used !== undefined) {
                        $scope.available = $scope.chartData.total - $scope.chartData.used;
                        $scope.used = $scope.chartData.used;
                    } else {
                        $scope.available = 100;
                        $scope.used = $scope.chartData["percent-used"];
                    }
                   
                    $scope.chartData["percent-used"] = parseInt($scope.chartData["percent-used"]);

                    $scope.getThresholdColor = function() {
                        if($scope.chartThresholds === undefined) {
                            $scope.chartThresholds = config.defaultThresholds.values;
                        }
                        if ($scope.chartData["percent-used"] >= parseInt($scope.chartThresholds.error)) {
                            return config.defaultThresholds.colors.error;
                        } else if ($scope.chartData["percent-used"] >= parseInt($scope.chartThresholds.warning)) {
                            return config.defaultThresholds.colors.warning;
                        } else {
                            return config.defaultThresholds.colors.normal;
                        }
                    }

                },

                templateUrl: "/commons/components/donut-chart/donut-chart.html"
        }
    }

}());