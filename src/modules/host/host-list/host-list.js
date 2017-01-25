(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("hostController", hostController);

    /*@ngInject*/
    function hostController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this, clusterObj, associatedHosts = [];

        vm.isDataLoading = true;

        init();

        function init() {
            utils.getObjectList("Node").then(function(list) {
                vm.isDataLoading = false;
                vm.hostList = [];
                if(list !== null) {
                    if(typeof $scope.clusterId !== "undefined") {
                        associatedHosts = utils.getAssociatedHosts(list.nodes,$scope.clusterId);
                        vm.hostList = setupHostListData(associatedHosts);
                    } else {
                        vm.hostList = setupHostListData(list.nodes,list.clusters);

                    }
                }
            });
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

        function setupHostListData(list,clusters) {
            var role = {
                "mon": "Monitor",
                "osd": "OSD Host",
                "server": "Peer",
                "rados": "RADOS Gateway"
            }
            var i, j, length = list.length, hostList=[], host, stats, tags;
            for (i = 0; i < length; i++) {
                host={};
                clusterObj = {};
                tags = list[i].tags.split("/")
                host.cluster_name = "Unassigned";
                host.id = list[i].node_id;
                host.status = list[i].status;
                host.name = list[i].fqdn;
                host.role = role[tags[1]];
                clusterObj = utils.getClusterDetails(list[i].tendrlcontext.integration_id);
                if(typeof clusterObj !== "undefined") {
                    host.cluster_name = clusterObj.name;
                }
                if(typeof list[i].stats !== "undefined") {
                    list[i].stats = list[i].stats.replace(/'/g, '"');
                    stats = JSON.parse(list[i].stats);
                    host.storage = stats.storage;
                    host.cpu = stats.cpu;
                    host.memory = stats.memory;
                    host.alert_count = stats.alert_cnt;
                }else {
                    host.alert_count = "NA";
                }   

                hostList.push(host);
            }
            return hostList;
        }

        /*Refreshing list after each 30 second interval*/
        var timer = $interval(function () {
          init();
        }, 1000 * config.refreshIntervalTime );

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });
    }

})();