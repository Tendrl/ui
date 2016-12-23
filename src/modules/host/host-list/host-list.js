(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("hostController", hostController);

    /*@ngInject*/
    function hostController($scope, $interval, utils, config) {
        var vm = this;

        init();
        vm.setupHostListData = setupHostListData;

        function init() {
            utils.getObjectList("Node").then(function(list) {
                vm.hostList = [];
                if(list !== null) {
                   vm.hostList = vm.setupHostListData(list.nodes);
                }
            });
        }

        function setupHostListData(list) {
            var i, length = list.length, hostList=[], host;
            for (i = 0; i < length; i++) {
                host={};
                for(var propName in list[i]) {
                    if(list[i].hasOwnProperty(propName)) {
                        //Checking only two condition because propName can have either "stats" or not
                        if(propName !== "stats") {
                            host.id = list[i][propName].node.node_id;
                            host.status = list[i][propName].node.status;
                            host.name = list[i][propName].node.fqdn;
                            host.role = list[i][propName].node.role;
                            host.cluster_name = utils.getClusterDetails(list[i][propName].tendrl_context.cluster_id);
                        } else if (propName === "stats"){
                            host.storage = list[i].stats.storage;
                            host.cpu = list[i].stats.cpu;
                            host.memory = list[i].stats.memory;
                            host.alert_count = list[i].stats.alert_cnt;
                        }
                    }
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