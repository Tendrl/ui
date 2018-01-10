(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("hostList", {

            restrict: "E",
            templateUrl: "/modules/hosts/host-list/host-list.html",
            bindings: {
                clusterId: "=?"
            },
            controller: hostController,
            controllerAs: "hostCntrl"
        });

    /*@ngInject*/
    function hostController($scope, $rootScope, $state, $interval, utils, config, nodeStore, clusterStore) {
        var vm = this,
            clusterObj,
            hostListTimer;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.filterBy = "name";
        vm.orderBy = "name";
        vm.orderByValue = "Name";
        vm.filterByValue = "Name";
        vm.filterPlaceholder = "Name";
        vm.hostList = [];

        vm.redirectToGrafana = redirectToGrafana;
        vm.goToHostDetail = goToHostDetail;
        vm.addTooltip = addTooltip;
        vm.clearAllFilters = clearAllFilters;
        vm.changingFilterBy = changingFilterBy;
        vm.changingOrderBy = changingOrderBy;


        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostController
         */
        function init() {
            vm.showDetailBtn = vm.clusterId ? true : false;

            if ($rootScope.clusterData && $rootScope.clusterData.length) {
                var clusters;
                clusters = clusterStore.formatClusterData($rootScope.clusterData);

                nodeStore.getNodeList(clusters, vm.clusterId)
                    .then(function(list) {
                        $interval.cancel(hostListTimer);
                        vm.hostList = list;
                        startTimer();
                    }).catch(function(e) {
                        vm.hostList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {

                        var clusters;
                        $rootScope.clusterData = data;
                        clusters = clusterStore.formatClusterData($rootScope.clusterData);

                        nodeStore.getNodeList(clusters, vm.clusterId)
                            .then(function(list) {
                                $interval.cancel(hostListTimer);
                                vm.hostList = list;
                                startTimer();
                            }).catch(function(e) {
                                vm.hostList = [];
                            }).finally(function() {
                                vm.isDataLoading = false;
                            });
                    });
            }
        }

        function startTimer() {

            hostListTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        function redirectToGrafana(host, $event) {
            utils.redirectToGrafana("hosts", $event, {
                clusterId: host.integrationId,
                hostName: host.name.split(".").join("_")
            });
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostListTimer);
        });

        function goToHostDetail(host) {
            if (vm.clusterId) {
                $state.go("host-detail", { clusterId: vm.clusterId, hostId: host.id });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function clearAllFilters() {
            vm.searchBy = {};
            vm.filterBy = "name";
        }

        function changingFilterBy(filterValue) {
            vm.filterBy = filterValue;
            switch (filterValue) {
                case "name":
                    vm.filterByValue = "Name";
                    vm.filterPlaceholder = "Name";
                    break;

                case "cluster_name":
                    vm.filterByValue = "Cluster";
                    vm.filterPlaceholder = "Cluster Name";
                    break;

                case "role":
                    vm.filterByValue = "Role";
                    vm.filterPlaceholder = "Role";
                    break;

                case "status":
                    vm.filterByValue = "Status";
                    vm.filterPlaceholder = "Status";
                    break;
            };
        }

        function changingOrderBy(orderValue) {
            vm.orderBy = orderValue;
            switch (orderValue) {
                case "name":
                    vm.orderByValue = "Name";
                    break;

                case "cluster_name":
                    vm.orderByValue = "Cluster";
                    break;

                case "role":
                    vm.orderByValue = "Role";
                    break;
            };
        }
    }

})();