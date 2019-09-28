(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("peerStore", peerStore);

    /*@ngInject*/
    function peerStore($state, $q, utils, hostFactory) {
        var store = this,
            index;

        store.peerList = [];

        /**
         * @name findRole
         * @desc returns the role for a peer
         * @memberOf peerStore
         */
        store.findRole = function(tags) {
            var role = {
                "mon": "Monitor",
                "osd": "OSD Host",
                "server": "Gluster Peer",
                "rados": "RADOS Gateway",
                "central-store": "Web Admin Server"
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

                role: role[tags[1]],
                release: tags ? tags[0] : "NA"
            };
        };

        /**
         * @name getNodeList
         * @desc returns list of peers present in Tendrl/cluster
         * @memberOf peerStore
         */
        store.getNodeList = function(clusterId, state) {
            var list,
                deferred,
                associatedHosts = [];

            deferred = $q.defer();
            hostFactory.getNodeList(clusterId)
                .then(function(data) {
                    if (data !== null) {
                        list = _formatHostData(data.peers);
                        store.peerList = list;
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

                    //host.clusterId = list[i].cluster.cluster_id || "NA";
                    //host.clusterName = list[i].cluster.integration_id;
                    host.id = list[i].id;
                    host.name = list[i].name;
                    host.online = list[i].online;
                    host.ipAddress = list[i].ipv4_addr;
                    host.role = store.findRole(["gluster/server"]);
                    //host.role = store.findRole(list[i].tags) ? store.findRole(list[i].tags).role : "None";
                    //host.integrationId = list[i].cluster.integration_id;
                    //host.version = list[i].cluster.sds_version || "NA";
                    host.managed = "Yes" // list[i].is_managed === "yes" ? "Yes" : "No";

                    if (host.managed === "Yes") {
                        host.status = list[i].status;
                        host.alerts = list[i].alert_counters ? list[i].alert_counters.alert_count : "No Data";
                        host.bricks = list[i].bricks_count || "No Data";
                    } else {

                        if (state === "expanding") {
                            host.status = "Importing host to expand cluster";
                        } else {
                            host.status = "Not Managed";
                        }

                        host.bricks = "None";
                        host.alerts = "None";
                    }

                    hostList.push(host);
                }
                return hostList;
            }
        };

        store.getNodeObject = function(hostId) {
            var len = store.peerList.length,
                i;

            for (i = 0; i < len; i++) {
                if (store.peerList[i].id === hostId) {
                    return store.peerList[i];
                }
            }

            return null;

        };

        store.isAnyHostUnmanaged = function(hostList) {

            return hostList.some(function(host) {
                return (host.managed === "No");
            });
        };

        function _getManagedState(clusters, host) {
            var len = clusters.length,
                i;

            for (i = 0; i < len; i++) {
                if (clusters[i].clusterId === host.integrationId) {
                    return clusters[i].managed;
                }
            }
        }

    }

})();
