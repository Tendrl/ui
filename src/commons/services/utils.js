(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("utils", utils);

    /*@ngInject*/
    function utils($http, config, $rootScope) {

        /* Cache the reference to this pointer */
        var vm = this, 
            clusterName, 
            volumeList,
            poolList,
            i, 
            index, 
            key, 
            clusterData, 
            len, 
            clusterObj;


        vm.takeAction = function(data, postUrl, formMethod, clusterId) {
            var url, actionRequest, request;

            /* TODO:- Need to find out the proper way for DELETE Request */
            if (formMethod === "DELETE") {
                data._method = formMethod;
            }

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + postUrl;
            } else {
                url = config.baseUrl + clusterId + "/" + postUrl;
            }

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        /* For object workflow service */
        vm.getObjectWorkflows = function(clusterId) {
            var url, objectWorkflowsRequest, request;

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + "Flows";
            } else {
                url = config.baseUrl + clusterId + "/Flows";
            }

            objectWorkflowsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(objectWorkflowsRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getObjectWorkflows");
                return null;
            }); 
        };

        vm.getObjectList= function(objectType, clusterId) {
            var url = "", getObjectListRequest, request;

            //will comment out once API is available
            // if (clusterId === undefined || clusterId === "") {
            //     url = config.baseUrl + "Get" + objectType +"List";
            // }

            url = config.baseUrl + "Get" + objectType +"List";

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getObjectList");
                return null;
            });
        };

        vm.importCluster = function(uri, data) {
            var url, actionRequest, request;

            url = config.baseUrl + uri;

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        vm.getClusterDetails = function(clusterId) {
            clusterName = "Unassigned";

            if($rootScope.clusterData !== null && typeof clusterId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++ ) {

                    if(clusterData[i].cluster_id === clusterId) {
                        clusterName = clusterData[i].tendrl_context.sds_name;
                        break;
                    }
                }
            }

            return clusterName;
        };

        vm.getFileShareDetails = function(clusterId) {
            volumeList = [];

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for ( i = 0; i < len; i++ ) {

                    if(typeof clusterData[i].volumes !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index in clusterData[i].volumes) {
                                volumeList.push(clusterData[i].volumes[index])
                            }

                        } else {

                            for(index in clusterData[i].volumes) {
                                volumeList.push(clusterData[i].volumes[index])
                            }
                        }   
                    }
                    
                }
            } else {
                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getFileShareDetails();
                });
            }
            return volumeList;
        };

        vm.getPoolDetails = function(clusterId) {
            poolList = [];

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++ ) {

                    if(typeof clusterData[i].pools !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index in clusterData[i].pools) {
                                poolList.push(clusterData[i].pools[index])
                            }

                        } else {

                            for(index in clusterData[i].pools) {
                                poolList.push(clusterData[i].pools[index])
                            }
                        }   
                    }
                }
            } else {
                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getPoolDetails();
                });
            }
            return poolList;
        };

    }

})();