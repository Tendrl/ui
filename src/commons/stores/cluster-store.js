(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($state, $q, clusterFactory) {
        var store = this;

        store.generateUUID = function() { // Public Domain/MIT
            var d = new Date().getTime();
            if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
                d += performance.now(); //use high-precision timer if available
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        };

        store.addHost = function(selectedHost, selectedCluster) {

            console.log(selectedHost, "selectedHost");
            var postData,
                deferred;

            deferred = $q.defer();
            _createPostData();
            clusterFactory.addHost(postData, selectedCluster)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;

            function _createPostData() {
                var len = selectedHost.length,
                    nodeConfiguration = {},
                    i;

                postData = {
                    "sds_name": "gluster",
                    "Cluster.node_configuration": {}
                };

                for (i = 0; i < len; i++) {
                    nodeConfiguration[selectedHost[i].node_id] = {};
                    nodeConfiguration[selectedHost[i].node_id].role = "glusterfs/node";
                    nodeConfiguration[selectedHost[i].node_id].provisioning_ip = selectedHost[i].provisioningIP;
                }

                postData["Cluster.node_configuration"] = nodeConfiguration;
                return postData;
            }

        };
    }

})();
