/*
    ============= How to use "barChart" directive ======

    - chartTitleData (mandatory):
    
        vm.chartTitleData = {
            "title": "Pools",
            "data": {
                "total" : 21,
                "error" : 3,
                "warning" : 2,
                "down": 1
            }
        }
            
    - isHorizontalBarChartShow (optional: by default - false):
    CASE1: if isHorizontalBarChartShow is true:

        In HTML file:

        <bar-chart chart-title-data="Cntrl.chartTitleData" is-horizontal-bar-chart-show="true" 
               horizontal-bar-chart-data="Cntrl.horizontalBarChartData">
        </bar-chart>

        In Controller file:

        vm.chartTitleData = {
            "title": "Pools",
            "data": {
                "total" : 21,
                "error" : 3,
                "warning" : 2,
                "down": 1
            }
        }

        vm.horizontalBarChartData = [
            {
                "title" : "h1",
                "data": 400
            },
            {
                "title" : "h2",
                "data": 360
            },
            {
                "title" : "h3",
                "data": 320
            },
            {
                "title" : "h4",
                "data": 175
            },
            {
                "title" : "h5",
                "data": 390
            }
        ]

    CASE2: if isHorizontalBarChartShow is false 

        In HTML file:

        <bar-chart chart-title-data="taskCntrl.chartTitleData" 
            chart-data="taskCntrl.chartData"></bar-chart>

        NOTE: No need to specify "isHorizontalBarChartShow" as false .
            by default it will be false. 

        In Controller file:

        vm.chartTitleData = {
            "title": "Pools",
            "data": {
                "total" : 21,
                "error" : 3,
                "warning" : 2,
                "down": 1
            }
        }

        vm.chartData = [
                {
                    "title" : "Ceph-Cluster1: Pool1",
                    "data" : {
                        "used": '43318391580',
                        "total": '72197319301'
                    }

                },
                {
                    "title" : "Ceph-Cluster1: Pool2",
                    "data" : {
                        "used": '21659195790',
                        "total": '72197319301'
                    }

                },
                {
                    "title" : "Ceph-Cluster1: Pool3",
                    "data" : {
                        "used": '57757855440',
                        "total": '72197319301'
                    }

                },
                {
                    "title" : "Ceph-Cluster1: Pool4",
                    "data" : {
                        "used": '36098659650',
                        "total": '72197319301'
                    }

                },
                {
                    "title" : "Ceph-Cluster1: Pool5",
                    "data" : {
                        "used": '64977587370',
                        "total": '72197319301'
                    }

                }
            ]

*/
(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("barChartController", barChartController);

    app.component("barChart", {
            bindings: {
                isHorizontalBarChartShow: "=?",
                chartTitleData: "=",
                chartData: "=?",
                chartThresholds: "=?",
                horizontalBarChartData: "=?"
            },
            controllerAs: "vm",
            controller: "barChartController",
            templateUrl: "/commons/components/bar-chart/bar-chart.html"
        }
    );

    /*@ngInject*/
    function barChartController($element, config, $filter) {
        var vm = this, i, len, dataObject;

        vm.dataArray = [];

        if(typeof vm.chartThresholds === 'undefined') {
            vm.chartThresholds = config.defaultThresholds.values;
        }

        if(typeof vm.isHorizontalBarChartShow === 'undefined') {
            vm.isHorizontalBarChartShow = false;
        }

        if(!vm.isHorizontalBarChartShow) {
            len = vm.chartData.length;
            for(i = 0 ; i < len ; i++) {
                dataObject = {};
                if( typeof vm.chartData[i].data !== 'undefined' && vm.chartData[i].data.total ) {
                    dataObject.dataAvailable = true;
                    dataObject.data = vm.chartData[i].data;
                    dataObject.title = vm.chartData[i].title;
                    dataObject.footer = "<strong>" + $filter('bytes')(dataObject.data.used) + "</strong>";
                } else {
                    dataObject.dataAvailable = false;
                }
                vm.dataArray.push(dataObject);
            }
        }

        vm.$postLink = function() {
            if(vm.isHorizontalBarChartShow) {
                  var horizontalBarChartConfig, horizontalBarChart, c3ChartDefaults, categories = [], columnsData = [['data1']], i, len = vm.horizontalBarChartData.length;
                  c3ChartDefaults = $().c3ChartDefaults();
                  for( i = 0 ; i < len ; i++) {
                    categories.push(vm.horizontalBarChartData[i].title);
                    columnsData[0].push(parseInt(vm.horizontalBarChartData[i].data));
                  }
                  horizontalBarChartConfig = $().c3ChartDefaults().getDefaultBarConfig(categories);
                  horizontalBarChartConfig.bindto = "#horizontal-bar-chart";
                  horizontalBarChartConfig.axis = {
                    rotated: true,
                    x: {
                      categories: categories,
                      type: 'category'
                    }
                  };
                  horizontalBarChartConfig.data = {
                    type: 'bar',
                    columns: columnsData
                  };
                  horizontalBarChart = c3.generate(horizontalBarChartConfig);
            }
        };

    }


}());