(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("actionStore", actionStore);

    /*@ngInject*/
    function actionStore($http) {

        /* Cache the reference to this pointer */
        var vm = this;

        vm.actionDetails = {};
        
        vm.setActionDetails = function(action, actionName) {
            vm.actionDetails = {
                action: action,
                actionName: actionName
            }
        };

        vm.getActionDetails = function() {
            return vm.actionDetails;
        };

        vm.takeAction = function(data) {
            var actionRequest = {
                method: vm.actionDetails.action.method,
                url: vm.actionDetails.action.url
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
                url: "../tendrl-frontend/dist/Tendrl/api/list.json"
                //url: serverIP + "/clusters"
            };
            var request = angular.copy(getListRequest);
            return $http(request).then(function (response) {
                    return response.data;
            });
        };
    }

})();
