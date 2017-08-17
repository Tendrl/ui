(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($state, $q, utils, nodeStore, clusterFactory) {
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
                    temp.managed = data[i].is_managed ? "Yes" : "No";

                    if (temp.managed === "No") {
                        temp.message = data[i].errors.length ? "Cluster Misconfigured" : "Ready to Import";
                    } else {
                        temp.message = "Ready to Use";
                    }
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
                tags,
                i;

            for (i = 0; i < len; i++) {
                obj = data.nodes[keys[i]];
                temp = {},
                    temp.nodeId = obj.node_id;
                temp.fqdn = obj.fqdn;
                temp.status = obj.status;
                tags = nodeStore.findRole(obj.tags);
                temp.role = tags.role;
                temp.release = tags.release + " " + data.sds_version;
                hostList.push(temp)
            }

            return hostList;
        };

        /**
         * @name importCluster
         * @desc store for import cluster
         * @memberOf clusterStore
         */
        store.importCluster = function(cluster, enableProfiling) {
            var requestData = {
                    sds_type: cluster.sdsName,
                    enableProfiling: enableProfiling
                },
                deferred;

            deferred = $q.defer();
            clusterFactory.importCluster(requestData)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };
    }

})();
