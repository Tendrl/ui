/*
    ============= How to use "donutChart" directive ======
            
    - chartTitle (optional):  expected string for title.
        NOTE:-  In UX design some of the place "title" is not there. so it should be optional.

    - chartData: Should be object with three properties - total, used and percent_used
        NOTE: - Here "total" and "used" are optional , But "percent_used" is mandatory property.
        Example: - 

        (In your controller):
        vm.chartData = {"used":352460800,"total":3524608000, "percent_used": 10} (defined chartData object)

        (In your template):
        <div ng-repeat="host in hostList"
            <div  class="col-md-2">
                <donut-chart class="list-view-pf-additional-info-item" chart-title="Storage" chart-data="host.chartData">
                </donut-chart>
            </div>
        </div>

        NOTE: if "vm.chartData.percent_used" is not defined . than automatically "donut chart" will show "no data available".

    - chartThresholds (optional) : if user will not pass thresholds value than it will have default value:
        {'warning':'60','error':'90'} (which is defined in "config.json"- because it should be configurable)
    
        (In your controller):
        vm.chartThresholds = {'warning':'40','error':'90'}; (defined chartThresholds object)

        (In your template):
         <div ng-repeat="host in hostList"
            <div  class="col-md-2">
                <donut-chart class="list-view-pf-additional-info-item" chart-title="Storage" chart-data="host.chartData" chart-thresholds="chartThresholds">
                </donut-chart>
            </div>
        </div>

*/
(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("donutChartController", donutChartController);

    app.component("donutChart", {
            bindings: {
                chartTitle: "@?",
                chartData: "=",
                chartThresholds: "=?"
            },
            controllerAs: "vm",
            controller: "donutChartController",
            templateUrl: "/commons/components/donut-chart/donut-chart.html"
        }
    );

    /*@ngInject*/
    function donutChartController($element, config) {
        var vm = this;
        vm.$postLink = function() {
            if(typeof vm.chartData !== "undefined") {
                var c3ChartDefaults = $().c3ChartDefaults();
                vm.customDonutChartConfig = c3ChartDefaults.getDefaultDonutConfig(vm.chartData["percent_used"]+"%");
                vm.customDonutChartConfig.size.height = 90;
                vm.customDonutChartConfig.size.width = 80;
                vm.customDonutChartConfig.donut.width = 10;
                vm.customDonutChartConfig.bindto = $element[0].childNodes[0];
                vm.customDonutChartConfig.color =  {
                    pattern: [vm.getThresholdColor(),"#D1D1D1"]
                };
                vm.customDonutChartConfig.data = {
                    type: "donut",
                    columns: [
                      [ "Used", vm.used ],
                      ["Available", vm.available ]
                    ],
                    groups: [
                      ["used", "available"]
                    ],
                    order: null
                };
                c3.generate(vm.customDonutChartConfig);
            }
        };

        if(typeof vm.chartData !== "undefined") { 
            if(parseInt(vm.chartData.total) && parseInt(vm.chartData.used)) {
                vm.available = parseInt(vm.chartData.total) - parseInt(vm.chartData.used);
                vm.used = parseInt(vm.chartData.used);
            } else {
                vm.available = 100 - parseInt(vm.chartData["percent_used"]);
                vm.used = parseInt(vm.chartData["percent_used"]);
            }
            vm.chartData["percent_used"] = parseInt(vm.chartData["percent_used"]);
        }
        else {
            vm.chartData = undefined
        }

        vm.getThresholdColor = function() {
            if(vm.chartThresholds === undefined) {
                vm.chartThresholds = config.defaultThresholds.values;
            }
            if (vm.chartData["percent_used"] >= parseInt(vm.chartThresholds.error)) {
                return config.defaultThresholds.colors.error;
            } else if (vm.chartData["percent_used"] >= parseInt(vm.chartThresholds.warning)) {
                return config.defaultThresholds.colors.warning;
            } else {
                return config.defaultThresholds.colors.normal;
            }
        }

    }


}());