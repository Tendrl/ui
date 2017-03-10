(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("dashboardController", dashboardController);

    /*@ngInject*/
    function dashboardController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this;
            
        vm.chartData = [];
        init();

        function init() {
            utils.getObjectList("trends-chart")
                .then(function(data) {
                    vm.chartData = data[0].datapoints;
                });
        }

        vm.IOPSConfig = {
            "chartId": "IOPSTrendsChart",
            "layout": "small",
            "units": "K",
            "tooltipType": "actual",
            "title": "IOPS",
            "timeFrame": "Last 24 hours"
        };

        vm.latencyConfig = {
            "chartId": "LatencyTrendsChart",
            "layout": "small",
            "units": "ms",
            "tooltipType": "actual",
            "title": "Latency",
            "timeFrame": "Last 24 hours"
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
