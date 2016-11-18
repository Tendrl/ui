(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("utils", utils);

    /*@ngInject*/
    function utils($http, config) {

        /* Cache the reference to this pointer */
        var vm = this

        vm.takeAction = function(data, postUrl, formMethod, clusterId) {
            var url, actionRequest, request;

            // Todo : formMethod should not be null from API
            if (formMethod === null || formMethod === "") {
                formMethod = "POST";
            }

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + postUrl;
            } else {
                url = config.baseUrl + clusterId + "/" + postUrl;
            }

            actionRequest = {
                method: formMethod,
                url: url,
                headers: config.requestHeader
            };

            request = angular.copy(actionRequest);
            request.data = data;

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
            }); 
        };

        vm.getObjectList= function(objectType, clusterId) {
            var url, getObjectListRequest, request;

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + "Get" + objectType +"List";
            } else {
                url = config.baseUrl + clusterId + "/Get" + objectType +"List";
            }

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getObjectList");
            });
        };

    }

})();