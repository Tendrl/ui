(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("fileShareController", fileShareController);

    /*@ngInject*/
    function fileShareController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this,
            timer,
            list,
            fileShareList,
            fileShare,
            fileShareObj,
            i,
            len,
            clusterObj;

        vm.createFileShare = createFileShare;

        init();

        function init() {
            list = utils.getFileShareDetails($scope.clusterId);
            vm.fileShareList = setupFileShareListData(list);
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

        function setupFileShareListData(list) {
            fileShareList = [];
            len = list.length;

            for (i = 0; i < len; i++) {
                fileShareObj = list[i];

                /* TODO: Need to remove when we have proper api response 
                and API should support for array data*/
                if (Object.keys(fileShareObj).length > 5) {
                    fileShare = {};
                    clusterObj = {};
                    fileShare.cluster_name = "Unassigned";
                    fileShare.id = fileShareObj.vol_id;
                    fileShare.status = fileShareObj.status;
                    fileShare.name = fileShareObj.name;
                    fileShare.type = fileShareObj.vol_type;
                    fileShare.storage = "NA";
                    clusterObj = utils.getClusterDetails(fileShareObj.cluster_id);
                    if(typeof clusterObj !== "undefined" && typeof clusterObj.tendrl_context !== "undefined") {
                        fileShare.cluster_name = clusterObj.tendrl_context.sds_name;
                    }
                    fileShare.brick_count = fileShareObj.brick_count;
                    fileShare.alert_count = "NA"
                    fileShare.last_rebalance = "NA";
                    fileShareList.push(fileShare);
                }
            }
            return fileShareList;
        }

        /*Refreshing list after each 30 second interval*/
        timer = $interval(function() {

            utils.getObjectList("Cluster")
                .then(function(data) {
                    $rootScope.clusterData = data;
                    init();
                });

        }, 1000 * config.refreshIntervalTime);

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });

        function createFileShare() {
            $state.go("add-inventory",{ clusterId: $scope.clusterId });
        }
    }

})();
