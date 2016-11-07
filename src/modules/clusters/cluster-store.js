(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($q, clusterFactory) {

        /* Cache the reference to this pointer */
        var store = this;

        store.getClusterList = function () {

            return clusterFactory.getClusterList()
                    .then(function (clusterData) {
                        return clusterData;
                    });
        };

        store.getClusterDetails = function(clusterInfo) {

            return clusterFactory.getClusterDetails(clusterInfo)
                    .then(function (details) {
                        return details;
                    });
        };

    }

})();
