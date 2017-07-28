(function() {
    "use strict";

    angular.module("TendrlModule")
        .component("hostList", {

            restrict: "E",
            templateUrl: "/modules/hosts/host-list/host-list.html",
            bindings: {},
            controller: hostController,
            controllerAs: "hostCntrl"
        });

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
