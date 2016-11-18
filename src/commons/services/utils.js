(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("utils", utils);

    /*@ngInject*/
    function utils($http, config) {

        /* Cache the reference to this pointer */
        var vm = this,
            actionDetails;

        vm.setActionDetails = function(action, actionName) {
            actionDetails = {
                action: action,
                actionName: actionName
            };

            //TODO: remove once API support is there
            actionDetails.action.method = "POST";
            actionDetails.action.url =  config.baseUrl + "cluster/" + config.clusterId + "/volume/create";
        };

        vm.getActionDetails = function() {
            
            if(actionDetails) {
                return actionDetails;
            } else {
                return null;
            }            
        };

        vm.takeAction = function(data, postUrl) {
            var actionRequest = {
                method: "POST",
                url: postUrl,
                headers: config.requestHeader
            };

            var request = angular.copy(actionRequest);
            request.data = data;

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        vm.getAttributeList = function(clusterId, inventory) {
            var actionRequest, request;

            actionRequest = {
                method: "GET",
                url: config.baseUrl + "cluster/" + clusterId + "/" + inventory + "/attributes",
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        vm.getActionList = function(cluster_id, inventory) {
            var actionRequest, request;

            actionRequest = {
                method: "GET",
                url: config.baseUrl + "cluster/" + cluster_id + "/" + inventory + "/actions",
            };

            request = angular.copy(actionRequest);
            return $http(request).then(function (response) {
                return response.data;
            });
        };

        /* For cluster specific service */
        vm.getClusterImportFlow = function() {
            var clusterImportFlowRequest, request;

            clusterImportFlowRequest = {
                method: "GET",
                url: config.baseUrl + "Flows"
            };

            request = angular.copy(clusterImportFlowRequest);

            return $http(request).then(function (response) {
                return response.data;
            }); 
        };

        vm.getObjectList= function(objectType) {
            var getObjectListRequest = {
                method: "GET",
                url: config.baseUrl + "Get" + objectType +"List"
            };
            var request = angular.copy(getObjectListRequest);
            return $http(request).then(function (response) {
                    return response.data;
            });
        };

    }

})();