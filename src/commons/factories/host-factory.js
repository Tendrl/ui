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
        vm.getNodeList = function() {
            var url = "",
                getObjectListRequest, request;

            url = config.baseUrl + "nodes";

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
