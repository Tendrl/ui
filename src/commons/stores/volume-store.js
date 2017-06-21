(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("volumeStore", volumeStore);

    /*@ngInject*/
    function volumeStore($state, $q, volumeFactory) {
        var store = this;

        store.doActionOnVolume = function(volume, mode) {
            var deferred;
                
            deferred = $q.defer();
            volumeFactory.doActionOnFileShare(volume, mode)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

    }

})();