(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("utils", utils);

    /*@ngInject*/
    function utils($http, config) {

        /* Cache the reference to this pointer */
        var vm = this;

        vm.actionDetails = {};
        
        vm.setActionDetails = function(action, actionName) {
            vm.actionDetails = {
                action: action,
                actionName: actionName
            };

            //TODO: remove once API support is there

            vm.actionDetails.action.method = "POST";
            vm.actionDetails.action.url =  config.baseUrl + "/cluster/" + config.clusterId + "/volume/create";
        };

        vm.getActionDetails = function() {
            return vm.actionDetails;
        };

        vm.takeAction = function(data) {
            var actionRequest = {
                method: vm.actionDetails.action.method,
                url: vm.actionDetails.action.url,
                headers: config.requestHeader
            };

            var request = angular.copy(actionRequest);
            request.data = data;

            return $http(request).then(function (response) {
                return response.data;
            });
        };
        
        vm.getListOptions= function() {
            var getListRequest;
            var getListRequest = {
                method: "GET",
                url: "/api/list.json"
                //url: serverIP + "/clusters"
            };
            var request = angular.copy(getListRequest);
            return $http(request).then(function (response) {
                    return response.data;
            });
        };

        vm.getAttributeList = function(clusterId, inventory) {
            var actionRequest, request;

            actionRequest = {
                method: "GET",
                url: config.baseUrl + "cluster/" + clusterId + '/' + inventory + '/attributes',
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            });
        };

        vm.getVolumeList = function(clusterId) {
            var volumeListRequest, request;

            volumeListRequest = {
                method: "GET",
                url: "/api/volumeList.json"
            }; 

            request = angular.copy(volumeListRequest);

            return $http(request).then(function (response) {
                return response.data;
            }); 
        };

        vm.getActionList = function(cluster_id, inventory) {
            var actionRequest, request;

            actionRequest = {
                method: "GET",
                url: config.baseUrl + 'cluster/' + cluster_id + '/' + inventory + '/actions',
            };

            request = angular.copy(actionRequest);
            return $http(request).then(function (response) {
                return response.data;
            });
        };
    }

})();