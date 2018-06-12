
const EventStore = {
    showAlertIndication: false,
    getAlertList: function() {
        var list,
            deferred,
            utils = window.ngDeps.utils,
            that = this;

        deferred = Q.defer();

        utils.getAlertList()
            .then(function(data) {

                that.showAlertIndication = false;
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
                    INFO: "info",
                    WARNING: "warning"
                },
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.alertId = data[i].alert_id;
                temp.timeStamp = new Date(data[i].time_stamp);
                temp.severity = severity[data[i].severity];
                temp.nodeId = data[i].node_id;
                temp.fqdn = data[i].tags.fqdn;
                temp.desc = data[i].tags.message;
                temp.clusterId = data[i].tags.integration_id ? data[i].tags.integration_id : "";
                temp.clusterName = data[i].tags.integration_id ? data[i].tags.integration_id : "";
                temp.sdsName = data[i].tags.sds_name ? data[i].tags.sds_name : "";

                if ((temp.severity === "error" || temp.severity === "warning") && !that.showAlertIndication) {
                    that.showAlertIndication = true;
                    PubSubService.publish("alertIndicationChanged", that.showAlertIndication);
                }
                res.push(temp);
            }
            return res;
        }
    },
    getEventList: function(clusterId) {
        var list,
            deferred,
            utils = window.ngDeps.utils;

        deferred = Q.defer();
        utils.getEventList(clusterId)
            .then(function(data) {
                list = data ? _formatEventData(data) : [];
                deferred.resolve(list);
            }).catch(function(e) {
                deferred.reject(e);
            });

        return deferred.promise;

        function _formatEventData(data) {
            var len = data.length,
                res = [],
                temp = {},
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.timeStamp = moment(new Date(data[i].timestamp)).format('DD-MMM-YY HH:mm:ss');
                temp.priority = data[i].priority;
                temp.message = data[i].message;
                temp.message_id = data[i].message_id;
                res.push(temp);
            }
            return res;
        }
    }
};

angular
    .module("TendrlModule")
    .service("eventStore", eventStore);

/*@ngInject*/
function eventStore() {
    return EventStore;
}
