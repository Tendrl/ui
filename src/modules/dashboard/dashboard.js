(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("dashboardController", dashboardController);

    /*@ngInject*/
    function dashboardController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this;

        var today = new Date();
        var dates = ["dates"];
        for (var d = 20 - 1; d >= 0; d--) {
            dates.push(new Date(today.getTime() - (d * 24 * 60 * 60 * 1000)));
        }

        vm.configVirtual = {
            "chartId": "virtualTrendsChart",
            "layout": "small",
            "trendLabel": "Virtual Disk I/O",
            "units": "GB",
            "tooltipType": "percentage",
            "title": "IOPS",
            "timeFrame": "Last 24 hours"
        };

        vm.dataVirtual = {
            "total": "250",
            "xData": dates,
            "yData": ["used", "90", "20", "30", "20", "20", "10", "14", "20", "25", "68", "44", "56", "78", "56", "67", "88", "76", "65", "87", "76"]
        };

        vm.configPhysical = {
            "chartId": "physicalTrendsChart",
            "layout": "small",
            "trendLabel": "Physical Disk I/O",
            "units": "MHz",
            "tooltipType": "percentage",
            "title": "Latency",
            "timeFrame": "Last 24 hours"
        };

        vm.dataPhysical = {
            "total": "250",
            "xData": dates,
            "yData": ["used", "20", "20", "35", "20", "20", "87", "14", "20", "25", "28", "44", "56", "78", "56", "67", "88", "76", "65", "87", "16"]
        };


        /* Temporary mocked data for bar-chart */
       
        vm.chartTitleData = {
            "title": "Pools",
            "data": {
                "total" : 21,
                "error" : 3,
                "warning" : 2
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

    }

})();
