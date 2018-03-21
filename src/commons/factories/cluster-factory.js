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
                method: "POST",
                url: url,
                data: {
                    "Cluster.volume_profiling_flag": action.toLowerCase()
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
         * @name doClusterUnmanage
         * @desc unmanages a cluster
         * @memberOf clusterFactory
         */
        vm.doClusterUnmanage = function(data, clusterId) {
            var url,
                unmanageRequest,
                request;

            url = config.baseUrl + "clusters/" + clusterId + "/unmanage";

            unmanageRequest = {
                method: "POST",
                url: url,
                data : data
            };

            request = angular.copy(unmanageRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while unmanaging the cluster");
                throw e;
            });
        };

        /**
         * @name expandUnmanage
         * @desc expands a cluster
         * @memberOf clusterFactory
         */
        vm.expandCluster = function(clusterId) {
            var url,
                expandRequest,
                request;

            url = config.baseUrl + "clusters/" + clusterId + "/expand";

            expandRequest = {
                method: "POST",
                url: url
            };

            request = angular.copy(expandRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while unmanaging the cluster");
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

        /**
         * @name getCluster 
         * @desc fetch a single cluster
         * @memberOf clusterFactory
         */
        vm.getCluster = function(clusterId) {
            var url = "",
                getObjectRequest, request;

            url = config.baseUrl + "clusters/" + clusterId;
            //url = "/api/getCluster.json";

            getObjectRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching getCluster");
                throw e;
            });
        };
    }

})();
