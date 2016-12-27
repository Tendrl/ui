(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("fileShareController", fileShareController);

    /*@ngInject*/
    function fileShareController($scope, $rootScope, $interval, utils, config) {
        var vm = this, timer, list, fileShareList, fileShare, fileShareObj, i, len;

        vm.setupFileShareListData = setupFileShareListData;
        init();

        function init() {
            list = utils.getFileShareDetails();
            vm.fileShareList = vm.setupFileShareListData(list);
        }

        function setupFileShareListData(list) {
            fileShareList=[];
            len = list.length;
            for ( i = 0; i < len; i++ ) {
                fileShareObj = list[i];
                /* TODO: Need to remove when we have proper api response 
                and API should support for array data*/
                if(Object.keys(fileShareObj).length > 5) {
                    fileShare = {};
                    fileShare.id = fileShareObj.vol_id;
                    fileShare.status = fileShareObj.status;
                    fileShare.name = fileShareObj.name;
                    fileShare.type = fileShareObj.vol_type;
                    fileShare.storage = "NA";
                    fileShare.cluster_name = utils.getClusterDetails(fileShareObj.cluster_id);
                    fileShare.brick_count = fileShareObj.brick_count;
                    fileShare.alert_count = "NA"
                    fileShare.last_rebalance = "NA";
                    fileShare.isExpand = false;
                    fileShareList.push(fileShare);
                }
            }
            return fileShareList;
        }

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
    }

})();