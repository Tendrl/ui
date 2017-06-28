(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("clusterFactory", clusterFactory);

    /*@ngInject*/
    function clusterFactory($state, $q, $http, utils, config) {
        var vm = this;

        vm.addHost = function(postData, selectedCluster) {
            var url, rebalanceRequest, request, requestData;

            url = config.baseUrl + selectedCluster.id + "/ExpandCluster";
            
            rebalanceRequest = {
                method: "PUT",
                url: url,
                data: postData
            };

            request = angular.copy(rebalanceRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
            });
        };

    }

})();
