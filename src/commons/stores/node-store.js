(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("nodeStore", nodeStore);

    /*@ngInject*/
    function nodeStore($state, $q, utils, hostFactory) {
        var store = this,
            tagsList,
            index;

        /**
         * @name findRole
         * @desc returns the role for a node
         * @memberOf nodeStore
         */
        store.findRole = function(tags) {
            var role = {
                "mon": "Monitor",
                "osd": "OSD Host",
                "server": "Peer",
                "rados": "RADOS Gateway",
                "central-store": "Server Node"
            };
            if (tags) {
                tagsList = JSON.parse(tags);
                if (tagsList.indexOf("tendrl/central-store") !== -1) {
                    index = tagsList.indexOf("tendrl/central-store");
                    tags = tagsList[index].split("/");
                } else if (tagsList.indexOf("ceph/mon") !== -1) {
                    index = tagsList.indexOf("ceph/mon");
                    tags = tagsList[index].split("/");
                } else if (tagsList.indexOf("ceph/osd") !== -1) {
                    index = tagsList.indexOf("ceph/osd");
                    tags = tagsList[index].split("/");
                } else if (tagsList.indexOf("gluster/server") !== -1) {
                    index = tagsList.indexOf("gluster/server");
                    tags = tagsList[index].split("/");
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
        store.getNodeList = function(clusterId) {
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
                    }
                    deferred.resolve(list);
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
                    host.cluster_name = list[i].cluster.cluster_name;
                    host.id = list[i].node_id;
                    host.status = list[i].status;
                    host.name = list[i].fqdn;
                    host.role = store.findRole(list[i].tags).role;

                    hostList.push(host);
                }
                return hostList;
            }
        };

    }

})();
