(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("brickFactory", brickFactory);

    /*@ngInject*/
    function brickFactory($state, $q, $http, utils, config) {
        var vm = this;

        /**
         * @name getHostBrickList
         * @desc fetch list of bricks
         * @memberOf brickFactory
         */
        vm.getHostBrickList = function(clusterId, fqdn) {
            var url = "",
                getHostBrickListRequest, request;

            url = config.baseUrl + "clusters/" + clusterId + "/nodes/" + fqdn + "/bricks";
            //url = "/api/GetHostBrickList.json";

            getHostBrickListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getHostBrickListRequest);
            return $http(request).then(function(response) {
                return response.data.bricks;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching getHostBrickList");
                throw e;
            });
        };

        /**
         * @name getVolumeBrickList
         * @desc fetch list of bricks
         * @memberOf brickFactory
         */
        vm.getVolumeBrickList = function(clusterId, volId) {
            var url = "",
                getVolumeBrickListRequest, request;

            url = config.baseUrl + "clusters/" + clusterId + "/volumes/" + volId + "/bricks";
            //url = "/api/GetVolumeBrickList.json";

            getVolumeBrickListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getVolumeBrickListRequest);
            return $http(request).then(function(response) {
                return response.data.bricks;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching getVolumeBrickList");
                throw e;
            });
        };
    }

})();
