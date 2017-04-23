(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("eventStore", eventStore);

    /*@ngInject*/
    function eventStore($state, $q, utils) {
        var store = this;

        store.getEventList = function() {
            var list,
                deferred;
                
            deferred = $q.defer();
            utils.getEventList()
                .then(function(data) {
                    //list = utils.formatDate(data, "created_at", "dd MMM yyyy");
                    deferred.resolve(data.alerts);
                });

            return deferred.promise;
        };
    }

})();