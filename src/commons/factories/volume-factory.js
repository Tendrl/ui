(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("volumeFactory", volumeFactory);

    /*@ngInject*/
    function volumeFactory($state, $q, $http, utils, config) {
        var vm = this;

        /**
         * @name getVolumeList
         * @desc fetch list of volume for a cluster
         * @memberOf volumeFactory
         */
        vm.getVolumeList = function(clusterId) {
            var url,
                getVolumeListRequest,
                request;

            url = config.baseUrl + "clusters/" + clusterId + "/volumes";
            //url = "/api/GetVolumeList.json";

            getVolumeListRequest = {
                method: "Get",
                url: url
            };

            request = angular.copy(getVolumeListRequest);
            return $http(request).then(function(response) {
                return response.data.volumes;
            }, function(e) {
                utils.checkErrorCode(e);
                console.log("Error Occurred: while fetching volume list");
                return null;
            });
        };
    }

})();
