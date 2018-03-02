(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("hostFactory", hostFactory);

    /*@ngInject*/
    function hostFactory($state, $q, $http, utils, config) {
        var vm = this;

        /**
         * @name getClusterList
         * @desc fetch list of nodes
         * @memberOf hostFactory
         */
        vm.getNodeList = function(clusterId) {
            var url = "",
                getObjectListRequest, request;

            url = config.baseUrl +"clusters/" + clusterId +"/nodes";
            //url = "/api/GetNodeList.json";

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching getNodeList");
                throw e;
            });
        };
    }

})();
