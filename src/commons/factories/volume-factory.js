(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("volumeFactory", volumeFactory);

    /*@ngInject*/
    function volumeFactory($state, $q, $http, utils, config) {
        var vm = this;

        vm.doActionOnVolume = function(volume, mode) {
            var url, actionRequest, request;

            if(mode === "stop") {
                url = config.baseUrl + volume.cluster_id + "/GlusterStopVolume";
            } else {
                url = config.baseUrl + volume.cluster_id + "/GlusterStartVolume";
            }

            actionRequest = {
                method: "POST",
                url: url,
                data: {
                    "Volume.vol_id": volume.id,
                    "Volume.volname": volume.name
                }
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
            });
        };

    }

})();