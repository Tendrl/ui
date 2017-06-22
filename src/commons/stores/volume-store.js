(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("volumeStore", volumeStore);

    /*@ngInject*/
    function volumeStore($state, $q, volumeFactory) {
        var store = this;

        store.doActionOnVolume = function(volume, mode) {
            var deferred;

            deferred = $q.defer();
            volumeFactory.doActionOnVolume(volume, mode)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        store.rebalanceVolume = function(volume, mode) {
            var deferred;

            deferred = $q.defer();
            volumeFactory.rebalanceVolume(volume, mode)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

    }

})();
