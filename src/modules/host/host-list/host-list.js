(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("hostController", hostController);

    /*@ngInject*/
    function hostController($scope, $rootScope, $state, $interval, utils, config) {
        var vm = this,
            clusterObj,
            timer,
            associatedHosts = [];

        vm.isDataLoading = true;

        init();

        function init() {
            utils.getObjectList("Node").then(function(list) {
                vm.isDataLoading = false;
                vm.hostList = [];
                if (list !== null) {
                    if (typeof $scope.clusterId !== "undefined") {
                        associatedHosts = utils.getAssociatedHosts(list.nodes, $scope.clusterId);
                        vm.hostList = setupHostListData(associatedHosts);
                    } else {
                        vm.hostList = setupHostListData(list.nodes, list.clusters);

                    }
                }
                startTimer();
            });
        }

        function startTimer() {

            timer = $interval(function() {

                utils.getObjectList("Node")
                    .then(function(list) {
                        $interval.cancel(timer);
                        vm.isDataLoading = false;
                        vm.hostList = [];
                        if (list !== null) {
                            if (typeof $scope.clusterId !== "undefined") {
                                associatedHosts = utils.getAssociatedHosts(list.nodes, $scope.clusterId);
                                vm.hostList = setupHostListData(associatedHosts);
                            } else {
                                vm.hostList = setupHostListData(list.nodes, list.clusters);
                            }
                        }
                        startTimer();
                    });

            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        function setupHostListData(list, clusters) {
            var role = {
                    "mon": "Monitor",
                    "osd": "OSD Host",
                    "server": "Peer",
                    "rados": "RADOS Gateway",
                    "central-store": "Server Node"
                },
                i, j, length = list.length,
                hostList = [],
                host, stats, tags;

            for (i = 0; i < length; i++) {
                host = {};

                if(list[i].tendrlcontext && list[i].tendrlcontext.sds_name === "ceph"){
                    tags = JSON.parse(list[i].tags)[0].split("/");
                }
                else{
                    tags = JSON.parse(list[i].tags)[1].split("/");
                }

                host.cluster_name = "Unassigned";
                host.id = list[i].node_id;
                host.status = list[i].status;
                host.name = list[i].fqdn;
                host.role = role[tags[1]];
                host.cluster_name = list[i].tendrlcontext.cluster_name;
                // clusterObj = utils.getClusterDetails(list[i].tendrlcontext.integration_id);

                // if(typeof clusterObj !== "undefined") {
                //     host.cluster_name = clusterObj.integration_name || "NA";
                // }
                if (typeof list[i].stats !== "undefined") {
                    stats = list[i].stats;
                    host.storage = stats.storage_usage && stats.storage_usage.total && stats.storage_usage.used ? stats.storage_usage : undefined;
                    host.cpu = stats.cpu_usage && stats.cpu_usage.percent_used ? stats.cpu_usage : undefined;
                    host.memory = stats.memory_usage && stats.memory_usage.total && stats.memory_usage.used ? stats.memory_usage : undefined;
                    host.alert_count = stats.alert_count;
                } else {
                    host.alert_count = "NA";
                }

                hostList.push(host);
            }
            return hostList;
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(timer);
        });
    }

})();
