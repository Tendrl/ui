(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, config, utils) {
        var vm = this,
            key,
            len,
            temp = [],
            clusterData,
            cluster,
            i;

        vm.importCluster = importCluster;

        init();

        function init() {
            _createClusterList();
        }

        /*Refreshing list after each 30 second interval*/
        var timer = $interval(function () {
            
            utils.getObjectList("cluster")
                .then(function(data) {
                    utils.clusterData = data;
                });
            
            init();

        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function importCluster() {
            $state.go("import-cluster");
        }

        function _createClusterList() {

            if (utils.clusterData !== null) {
                
                clusterData = utils.clusterData.clusters;
                len = clusterData.length;
                temp = [];

                for ( i = 0; i < len; i++) {
                    cluster = {};

                    for(key in clusterData[i]) {

                        if(key !== "stats") {
                    
                            cluster.name = clusterData[i][key].tendrl_context.sds_name;
                            cluster.id = clusterData[i][key].tendrl_context.cluster_id;
                        } else if (key === "stats") {
                            cluster.alertCount = clusterData[i].stats.alert_cnt;
                            cluster.storage = clusterData[i].stats.storage;
                        }                 
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
    }

})();