(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("nodeStore", nodeStore);

    /*@ngInject*/
    function nodeStore($state, $q, utils) {
        var store = this,
            tagsList,
            index;

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