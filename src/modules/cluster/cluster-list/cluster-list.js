(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, config, utils, $rootScope) {
        
        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            timer,
            stats,
            i,
            stats;

        vm.importCluster = importCluster;
        vm.goToClusterDetail = goToClusterDetail;

        init();

        function init() {
            _createClusterList();
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function (event, data) {
            /* Forward to home view if we don't have any cluster */    
            if($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0){
                $state.go("home");
            }else {
                init();
            }
        });

        timer = $interval(function () {
            
            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    init();
                });

        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function importCluster() {
            $state.go("import-cluster");
        }

        function _createClusterList() {

            if ($rootScope.clusterData !== null) {
                
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                temp = [];

                for ( i = 0; i < len; i++) {
                    cluster = {};

                    cluster.name = clusterData[i].maps ? clusterData[i].maps.config.cluster_name : "NA";
                    cluster.id = clusterData[i].cluster_id;

                    if(typeof clusterData[i].stats !== "undefined") {
                        stats = clusterData[i].stats.replace(/'/g, '"');
                        stats = JSON.parse(stats);
                        cluster.alertCount = stats.alert_cnt;
                        cluster.storage = stats.storage;
                    } else {
                        cluster.alertCount = "NA";
                    }

                    cluster.status = "NA";
                    cluster.hostCount = "NA";
                    cluster.poolCount = "NA";
                    cluster.iops = "IOPS-NA";
                    
                    temp.push(cluster);
                }
                vm.clusterList = temp;
            }
        }

        function goToClusterDetail(cluster_id) {
            $state.go("cluster-detail",{ clusterId: cluster_id });
        }
    }

})();