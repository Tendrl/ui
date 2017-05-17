(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("nodeStore", nodeStore);

    /*@ngInject*/
    function nodeStore($state, $q, utils) {
        var store = this,
            tagsList,
            index;

        store.generateJournalConf = function(hostList) {
            var list,
                deferred,
                requestData;
                
            deferred = $q.defer();
            requestData = _createJournalPostData(hostList);
            utils.generateJournalConf(requestData)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        function _createJournalPostData(hostList) {
            var len,
                i,
                requestData = {
                    "Cluster.node_configuration": {}
                };

            if(hostList.constructor === Array) {
                len = hostList.length;

                for ( i = 0; i < len; i++) {
                    if(hostList[i].selectedRole === "OSD Host" && hostList[i].storage_disks.length) {
                        requestData["Cluster.node_configuration"][hostList[i].node_id] = {storage_disks: hostList[i].storage_disks};
                    }
                }
            } else if(hostList.constructor === Object) {
                if(hostList.selectedRole === "OSD Host" && hostList.storage_disks.length) {
                    requestData["Cluster.node_configuration"][hostList.node_id] = {storage_disks: hostList.storage_disks};
                }
            }

            return requestData;
        }

        store.getNodeList = function() {
            var list,
                deferred;

            deferred = $q.defer();

            utils.getObjectList("Node")
                .then(function(hostList) {
                    deferred.resolve(hostList.nodes);
                });

            return deferred.promise;
        };

        store.filterNodeList = function(nodeList, nodeId) {
            var i;
            for (i = 0; i < nodeList.length; i++) {
                if (nodeList[i].node_id === nodeId) {
                    return nodeList[i];
                }
            }
        };

        store.findRole = function(tags) {
            var role = {
                "mon": "Monitor",
                "osd": "OSD Host",
                "server": "Peer",
                "rados": "RADOS Gateway",
                "central-store": "Server Node"
            };
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
            return role[tags[1]];
        }

    }

})();