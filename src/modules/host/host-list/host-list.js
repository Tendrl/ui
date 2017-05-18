(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("hostController", hostController);

    /*@ngInject*/
    function hostController($scope, $rootScope, $state, $interval, utils, config, nodeStore) {
        var vm = this,
            clusterObj,
            hostListTimer,
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

            hostListTimer = $interval(function() {

                utils.getObjectList("Node")
                    .then(function(list) {
                        $interval.cancel(hostListTimer);
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
            var i,
                j,
                length = list.length,
                hostList = [],
                tagsList,
                index,
                host, stats, tags;

            for (i = 0; i < length; i++) {
                host = {};

                host.cluster_id = list[i].tendrlcontext.cluster_id;
                host.id = list[i].node_id;
                host.status = list[i].status;
                host.name = list[i].fqdn;
                host.role = nodeStore.findRole(list[i].tags);
                host.cluster_name = list[i].tendrlcontext.cluster_name;
                if (typeof list[i].stats !== "undefined") {
                    stats = list[i].stats;
                    host.storage = stats.storage_usage && stats.storage_usage.total && stats.storage_usage.used && stats.storage_usage.percent_used? stats.storage_usage : undefined;
                    host.cpu = stats.cpu_usage && stats.cpu_usage.percent_used ? stats.cpu_usage : undefined;
                    host.memory = stats.memory_usage && stats.memory_usage.total && stats.memory_usage.used && stats.memory_usage.percent_used? stats.memory_usage : undefined;
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
            $interval.cancel(hostListTimer);
        });
    }

})();
