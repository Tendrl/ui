(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("eventStore", eventStore);

    /*@ngInject*/
    function eventStore($state, $q, utils) {
        var store = this;

        store.getAlertList = function() {
            var list,
                deferred;

            deferred = $q.defer();
            utils.getAlertList()
                .then(function(data) {
                    list = data ? _formatAlertData(data) : [];
                    deferred.resolve(list);
                });

            return deferred.promise;

            function _formatAlertData(data) {
                var len = data.length,
                    res = [],
                    temp = {},
                    severity = {
                        CRITICAL: "error",
                        OK: "info",
                        WARNING: "warning"
                    },
                    i;

                for (i = 0; i < len; i++) {
                    temp = {},
                        temp.alertId = data[i].alert_id;
                    temp.timeStamp = new Date(data[i].time_stamp);
                    temp.severity = severity[data[i].severity];
                    temp.nodeId = data[i].node_id;
                    temp.fqdn = data[i].tags.fqdn;
                    temp.desc = data[i].tags.message;
                    temp.clusterId = data[i].tags.cluster_id ? data[i].tags.cluster_id : "";
                    temp.clusterName = data[i].tags.cluster_name ? data[i].tags.cluster_name : "";
                    temp.sdsName = data[i].tags.sds_name ? data[i].tags.sds_name : "";
                    res.push(temp);
                }
                return res;
            }
        };

        store.getNotificationList = function() {
            var list,
                deferred;

            deferred = $q.defer();
            utils.getNotificationList()
                .then(function(data) {
                    list = data ? _formatNotificationData(data) : [];
                    deferred.resolve(list);
                });

            return deferred.promise;

            function _formatNotificationData(data) {
                var len = data.length,
                    res = [],
                    temp = {},
                    i;

                for (i = 0; i < len; i++) {
                    temp = {},
                        temp.timeStamp = new Date(data[i].timestamp);
                    temp.priority = data[i].priority;
                    temp.message = data[i].message;
                    temp.message_id = data[i].message_id;
                    res.push(temp);
                }
                return res;
            }
        };
    }

})();
