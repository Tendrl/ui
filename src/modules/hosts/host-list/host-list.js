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
    function hostController($scope, $rootScope, $state, $interval, utils, config, nodeStore) {
        var vm = this,
            clusterObj,
            hostListTimer;            

        vm.isDataLoading = true;
        vm.redirectToGrafana = redirectToGrafana;

        vm.goToHostDetail = goToHostDetail;

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostController
         */
        function init() {
            nodeStore.getNodeList(vm.clusterId)
                .then(function(list) {
                    $interval.cancel(hostListTimer);
                    vm.isDataLoading = false;
                    vm.hostList = list;
                    startTimer();
                });
        }

        function startTimer() {

            hostListTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        function redirectToGrafana(host, $event){
            utils.redirectToGrafana("hosts", $event, {clusterId: vm.clusterId,
                                                    hostName: host.name.split(".").join("_")});
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostListTimer);
        });

        function goToHostDetail(host) {
            if(vm.clusterId) {
                $state.go("host-detail", { clusterId: vm.clusterId , hostId: host.id});
            }
        }
    }

})();
