(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("poolController", poolController);

    /*@ngInject*/
    function poolController($scope, $state, $interval, config, utils) {
        var vm = this,
            key,
            len,
            poolList = [],
            pool,
            list,
            i,
            timer;

        init();

        function init() {
            list = utils.getPoolDetails();
            _createPoolList(list);
        }

        /*Refreshing list after each 30 second interval*/
        timer = $interval(function () {
            init();
        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });


        function _createPoolList(list) {

            len = list.length;
            poolList = [];

            for ( i = 0; i < len; i++) {
                pool = {};

                pool.name = list[i].poolname;
                pool.clusterId = list[i].cluster_id;
                pool.pgCount = list[i].pg_num;
                pool.clusterName = utils.getClusterDetails(list[i].cluster_id);

                pool.status = "NA";
                pool.utilization = "Utilisation-NA";
                pool.replicaCount = "NA";
                pool.osdCount = "NA";
                pool.quotas = "NA";
                pool.alertCount = "NA";
                
                poolList.push(pool);
                
            }
            vm.poolList = poolList;
        }
    }

})();