(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("clusterController", clusterController);

    /*@ngInject*/
    function clusterController($scope, $state, $interval, config, $filter, utils) {
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
                    config.clusterData = data;
                });
            
            init();

        }, 1000 * config.initData.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function importCluster() {
            $state.go("import-cluster");
        }

        function _createClusterList() {

            if (config.clusterData !== null) {
                
                clusterData = config.clusterData.clusters;
                len = clusterData.length;
                temp = [];

                for ( i = 0; i < len; i++) {
                    cluster = {};
                    key = Object.keys(clusterData[i]);
                    
                    cluster.name = clusterData[i][key[0]].tendrl_context.sds_name;
                    cluster.id = clusterData[i][key[0]].tendrl_context.cluster_id;
                    cluster.alertCount = clusterData[i].stats.alert_cnt;
                    cluster.storage = clusterData[i].stats.storage;

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