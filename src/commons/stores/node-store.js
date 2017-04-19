(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("nodeStore", nodeStore);

    /*@ngInject*/
    function nodeStore($state, $q, utils) {
        var store = this;

        store.getJournalConf = function() {
            var list,
                deferred;
                
            deferred = $q.defer();
            utils.getJournalConf()
                .then(function(data) {
                    deferred.resolve(data.journal_details);
                });

            return deferred.promise;
        };
    }

})();