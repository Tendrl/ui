(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($state, $q, utils, nodeStore) {
        var store = this;

        /**
         * @name getClusterList
         * @desc store for GetClusterList
         * @memberOf clusterStore
         */
        store.getClusterList = function() {
            var list,
                deferred;

            deferred = $q.defer();
            utils.getObjectList("Cluster")
                .then(function(data) {
                    list = data ? _formatClusterData(data.clusters) : [];
                    deferred.resolve(list);
                });

            return deferred.promise;

            function _formatClusterData(data) {
                var len = data.length,
                    res = [],
                    temp = {},
                    i;

                for (i = 0; i < len; i++) {
                    temp = {};
                    temp.integrationId = data[i].integration_id;
                    temp.sdsVersion = data[i].sds_version;
                    temp.sdsName = data[i].sds_name;
                    temp.name = data[i].cluster_name;
                    temp.clusterId = data[i].cluster_id;
                    if (temp.sdsName === "gluster") {
                        if (data[i].globaldetails.status === "healthy") {
                            temp.status = "HEALTH_OK";
                        } else if (data[i].globaldetails.status === "unhealthy") {
                            temp.status = "HEALTH_ERR";
                        }
                    } else {
                        temp.status = data[i].globaldetails.status;
                    }
                    temp.managed = "Yes";
                    temp.hosts = store.getAssociatedHosts(data[i]);
                    res.push(temp);
                }
                return res;
            }
        };

        /**
         * @name getAssociatedHosts
         * @desc returns the associated host with a cluster
         * @memberOf clusterStore
         */
        store.getAssociatedHosts = function(data) {
            var hostList = [],
                keys = Object.keys(data.nodes),
                len = keys.length,
                temp,
                obj,
                i;

            for (i = 0; i < len; i++) {
                obj = data.nodes[keys[i]];
                temp = {},
                    temp.nodeId = obj.node_id;
                temp.fqdn = obj.fqdn;
                temp.status = obj.status;
                temp.role = nodeStore.findRole(obj.tags);
                hostList.push(temp)
            }

            return hostList;
        };
    }

})();
