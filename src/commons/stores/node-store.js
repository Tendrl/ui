(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("nodeStore", nodeStore);

    /*@ngInject*/
    function nodeStore($state, $q, utils, hostFactory) {
        var store = this,
            index;

        store.nodeList = [];

        /**
         * @name findRole
         * @desc returns the role for a node
         * @memberOf nodeStore
         */
        store.findRole = function(tags) {
            var role = {
                "mon": "Monitor",
                "osd": "OSD Host",
                "server": "Gluster Peer",
                "rados": "RADOS Gateway",
                "central-store": "Tendrl Server"
            };
            if (tags) {
                if (tags.indexOf("tendrl/central-store") !== -1) {
                    index = tags.indexOf("tendrl/central-store");
                    tags = tags[index].split("/");
                } else if (tags.indexOf("ceph/mon") !== -1) {
                    index = tags.indexOf("ceph/mon");
                    tags = tags[index].split("/");
                } else if (tags.indexOf("ceph/osd") !== -1) {
                    index = tags.indexOf("ceph/osd");
                    tags = tags[index].split("/");
                } else if (tags.indexOf("gluster/server") !== -1) {
                    index = tags.indexOf("gluster/server");
                    tags = tags[index].split("/");
                }
            }

            return {
                role: tags ? role[tags[1]] : "NA",
                release: tags ? tags[0] : "NA"
            };
        };

        /**
         * @name getNodeList
         * @desc returns list of nodes present in Tendrl/cluster
         * @memberOf nodeStore
         */
        store.getNodeList = function(clusters, clusterId) {
            var list,
                deferred,
                associatedHosts = [];

            deferred = $q.defer();
            hostFactory.getNodeList()
                .then(function(data) {
                    if (data !== null) {
                        if (typeof clusterId !== "undefined") {
                            associatedHosts = utils.getAssociatedHosts(data.nodes, clusterId);
                            list = _formatHostData(associatedHosts);
                        } else {
                            list = _formatHostData(data.nodes);

                        }
                        store.nodeList = list;
                    }
                    deferred.resolve(list);
                }).catch(function(e) {
                    deferred.reject(e);
                });


            return deferred.promise;

            function _formatHostData(list) {
                var i,
                    j,
                    length = list.length,
                    hostList = [],
                    tagsList,
                    index,
                    host, stats, tags;

                for (i = 0; i < length; i++) {
                    host = {};

                    host.cluster_id = list[i].cluster.cluster_id || "NA";
                    host.cluster_name = list[i].cluster.integration_id;
                    host.id = list[i].node_id;
                    host.status = list[i].status;
                    host.name = list[i].fqdn;
                    host.role = store.findRole(list[i].tags).role;
                    host.integrationId = list[i].cluster.integration_id;
                    host.managed = _getManagedState(clusters, host);
                    host.alerts = list[i].alert_counters ? list[i].alert_counters.warning_count : "No Data";

                    hostList.push(host);
                }
                return hostList;
            }
        };

        store.getNodeObject = function(hostId) {
            var len = store.nodeList.length,
                i;

            for (i = 0; i < len; i++) {
                if (store.nodeList[i].id === hostId) {
                    return store.nodeList[i];
                }
            }

            return null;

        };

        function _getManagedState(clusters, host) {
            var len = clusters.length,
                i;

            for (i = 0; i < len; i++) {
                if(clusters[i].clusterId === host.integrationId) {
                    return clusters[i].managed;
                }
            }
        }

    }

})();
