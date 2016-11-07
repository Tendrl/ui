(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("dataStorage", dataStorage);

    /*@ngInject*/
    function dataStorage() {

        /* Cache the reference to this pointer */
        var vm = this,
            clusterInfo = {};

        vm.setClusterInfo = function(details) {
            clusterInfo.health = details.status;
            clusterInfo.clusterName = details.name;
            clusterInfo.id = details.id;
        };

        vm.getClusterInfo = function() {
            return clusterInfo;
        };
        
    }

})();
