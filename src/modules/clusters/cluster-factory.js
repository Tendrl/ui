(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.factory("clusterFactory", ["$http", clusterFactory]);

    /*@ngInject*/
    function clusterFactory($http, serverIP) {

        var getClusterListRequest;

        getClusterListRequest = {
            method: "GET",
            url: "/dist/Tendrl/api/cluster-list.json"
            //url: serverIP + "/clusters"
        };

        function getClusterList() {
            var request = angular.copy(getClusterListRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        }

        function getClusterDetails(clusterInfo) {
            var request = angular.copy(getClusterListRequest);

            //request.url += "/" + clusterInfo.id;

            return $http(request).then(function (response) {
                return response.data;
            });
        }

        return {
            getClusterList: getClusterList,
            getClusterDetails: getClusterDetails
        };
    }

}());
