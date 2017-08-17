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
        vm.importCluster = function(data) {
            var url,
                importRequest,
                request;

            url = config.baseUrl + "ImportCluster";

            importRequest = {
                method: "POST",
                url: url,
                data: data
            };

            request = angular.copy(importRequest);
            console.log(request);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while import cluster");
                return null;
            });
        };
    }

})();
