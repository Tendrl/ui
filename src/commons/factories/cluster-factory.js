(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("clusterFactory", clusterFactory);

    /*@ngInject*/
    function clusterFactory($state, $q, $http, utils, config) {
        var vm = this;

        /**
         * @name importCluster
         * @desc Perform import cluster
         * @memberOf clusterFactory
         */
        vm.importCluster = function(data, clusterId) {
            var url,
                importRequest,
                request;

            url = config.baseUrl + "clusters/" + clusterId + "/import";

            importRequest = {
                method: "POST",
                url: url,
                data: data
            };

            request = angular.copy(importRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while import cluster");
                return null;
            });
        };

        /**
         * @name doProfilingAction
         * @desc enable/disable volume profile for cluster
         * @memberOf clusterFactory
         */
        vm.doProfilingAction = function(clusterId, action) {
            var url,
                profileRequest,
                request;

            url = config.baseUrl + "clusters/" + clusterId + "/profiling";

            profileRequest = {
                method: "PUT",
                url: url,
                data: {
                    enable_volume_profiling: (action === "Enable" ? "yes" : "no")
                }
            };

            request = angular.copy(profileRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while enabling/disabling profiling");
                throw e;
            });
        };

        /**
         * @name getClusterList
         * @desc fetch list of clusters
         * @memberOf clusterFactory
         */
        vm.getClusterList = function() {
            var url = "",
                getObjectListRequest, request;

            url = config.baseUrl + "clusters";
            //url = "/api/GetClusterList.json";

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching getClusterList");
                throw e;
            });
        };
    }

})();
