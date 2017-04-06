(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("taskStore", taskStore);

    /*@ngInject*/
    function taskStore($state, $q, utils) {
        var store = this;

        store.getJobList = function() {
            var list,
                deferred;
                
            deferred = $q.defer();
            utils.getJobList()
                .then(function(data) {
                    //list = utils.formatDate(data, "created_at", "dd MMM yyyy");
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        store.getJobDetail = function(jobId) {
            var deferred = $q.defer();

            utils.getJobDetail(jobId)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        store.getTaskLogs = function(jobId) {
            var logs,
                deferred;

            deferred = $q.defer();
            utils.getTaskLogs(jobId)
                .then(function(data) {
                    if(data) {
                        logs = _formatData(data);
                    }
                    deferred.resolve(logs);
                });

            function _formatData(messages) {
                var msgs = [],
                    msg,
                    i,
                    len = messages.length;

                for (i = 0; i < len; i++) {
                    msg = {};
                    msg.type = messages[i].priority;
                    msg.message = messages[i].payload.message;
                    msg.date = messages[i].timestamp;
                    msgs.push(msg);
                }

                return msgs;
            }

            return deferred.promise;
        };

        store.getTaskStatus = function(jobId) {
            var deferred = $q.defer();

            utils.getTaskStatus(jobId)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };
    }

})();