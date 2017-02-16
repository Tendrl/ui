(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("rbdController", rbdController);

    /*@ngInject*/
    function rbdController($scope, $rootScope, $state, $interval, config, utils) {
        var vm = this,
            key,
            len,
            rbdList = [],
            rbd,
            list,
            i,
            timer,
            clusterObj;

        vm.createRbd = createRbd;

        init();

        function init() {
            console.log("controller");
            list = utils.getRBDsDetails($scope.clusterId);
            _createRbdList(list);
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

        /*Refreshing list after each 30 second interval*/
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


        function _createRbdList(list) {
            var utilization_percent;
            len = list.length;
            rbdList = [];

            for ( i = 0; i < len; i++) {
                rbd = {};
                clusterObj = {};
                
                rbd.name = list[i].name;
                rbd.clusterId = list[i].clusterId;
                rbd.clusterName = list[i].clusterName;
                if( typeof list[i].used !== "undefined" && typeof list[i].provisioned !== "undefined") {
                    utilization_percent = ( (parseInt(list[i].used) * 100) / parseInt(list[i].provisioned) );
                    rbd.utilization = {"percent_used": utilization_percent };
                }
                rbd.backingPool = list[i].backingPool;
                rbd.isBackingPoolShared = list[i].isBackingPoolShared;
                rbd.alertCount = "NA";
                
                rbdList.push(rbd);
                
            }
            vm.rbdList = rbdList;
        }

        function createRbd() {
            $state.go("add-inventory",{ clusterId: $scope.clusterId });
        }
    }

})();