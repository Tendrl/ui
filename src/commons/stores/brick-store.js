(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("brickStore", brickStore);

    /*@ngInject*/
    function brickStore($state, $q, $filter, $stateParams, brickFactory, volumeStore) {
        var store = this;

        store.getHostBrickList = function(clusterId, fqdn) {
            var list,
                deferred;

            deferred = $q.defer();
            brickFactory.getHostBrickList(clusterId, fqdn)
                .then(function(data) {
                    list = _formatData(data);
                    deferred.resolve(list);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;

            function _formatData(data) {
                var len = data.length,
                    obj,
                    list = [],
                    utilization = {},
                    i;

                for (i = 0; i < len; i++) {
                    obj = {};
                    obj.name = data[i].name;
                    obj.volId = data[i].vol_id;
                    obj.volName = data[i].vol_name;
                    obj.brickPath = data[i].brick_path;
                    obj.disk_type = data[i].disk_type;
                    obj.port = data[i].port;
                    obj.devices = data[i].devices;
                    utilization = data[i].utilization;
                    obj.utilization = {};
                    obj.utilization.used = utilization.used_percent.toFixed(2);
                    obj.utilization.total = $filter("bytes")(utilization.total, 2);
                    obj.status = data[i].status.toLowerCase();
                    list.push(obj);
                }

                return list;

            }
        };

        store.getVolumeBrickList = function(clusterId, volId) {
            var subVolumes = [],
                deferred,
                len,
                i;

            deferred = $q.defer();
            brickFactory.getVolumeBrickList(clusterId, volId)
                .then(function(data) {
                    _createSubVolumes(data);
                    len = subVolumes.length;
                    for (i = 0; i < len; i++) {
                        subVolumes[i].utilization = _calcUtilization(subVolumes[i].bricks);
                    }

                    deferred.resolve(subVolumes);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;

            function _formatBrickData(data) {
                var obj;

                obj = {};
                obj.name = data.name;
                obj.volId = data.vol_id;
                obj.volName = data.vol_name;
                obj.brickPath = data.brick_path;
                obj.disk_type = data.disk_type;
                obj.port = data.port;
                obj.devices = data.devices || [];
                obj.fqdn = data.fqdn;
                obj.utilization = {};
                obj.utilization.used = data.utilization.used_percent.toFixed(2);
                obj.utilization.total = data.utilization.total;
                obj.status = data.status.toLowerCase();

                return obj;
            }

            function _calcUtilization(bricks) {
                var len = bricks.length,
                    utilization = { used: 0, total: 0 },
                    i,
                    percent_used,
                    used,
                    total;

                for (i = 0; i < len; i++) {
                    used = parseFloat(bricks[i].utilization.used);
                    total = parseFloat(bricks[i].utilization.total);
                    utilization.used += (used * total) / 100;
                    utilization.total += parseFloat(bricks[i].utilization.total);
                }
                percent_used = (utilization.used / utilization.total) * 100;
                utilization.used = percent_used.toFixed(2);
                utilization.total = utilization.total;

                return utilization;
            }

            function _createSubVolumes(list) {
                var len = list.length,
                    temp = {},
                    vol = volumeStore.getVolumeObject($stateParams.volumeId),
                    index,
                    prefix = "",
                    i;

                if (vol !== null) {
                    prefix = _getSubVolPrefix(vol.type);

                    for (i = 0; i < len; i++) {
                        if (list[i].subvolume) {
                            temp = {};
                            temp.sequenceNumber = parseInt(list[i].subvolume.split("volume")[1]);
                            temp.subVolumeName = prefix + temp.sequenceNumber;
                            index = _isSubVolPresent(temp.sequenceNumber);
                            if (index !== -999) {
                                subVolumes[index].bricks.push(_formatBrickData(list[i]));
                            } else {
                                subVolumes.push(temp);
                                subVolumes[subVolumes.length - 1].bricks = [];
                                subVolumes[subVolumes.length - 1].bricks.push(_formatBrickData(list[i]));
                            }
                        }
                    }
                }

                function _isSubVolPresent(sequenceNumber) {
                    var len = subVolumes.length,
                        i;

                    for (i = 0; i < len; i++) {
                        if (subVolumes[i].sequenceNumber === sequenceNumber) {
                            return i;
                        }
                    }

                    return -999;
                }

                function _getSubVolPrefix(type) {
                    var prefix = "";

                    if (type) {
                        switch (type.toLowerCase()) {

                            case "replicate":
                            case "distributed-replicate":
                            case "arbiter":
                                prefix = "Replica Set ";
                                break;

                            case "disperse":
                            case "distributed-dispersed":
                                prefix = "Dispersed Set ";
                                break;

                            case "distribute":
                            default:
                                prefix = "Subvolume ";
                                break;
                        }
                    } else {
                        prefix = "Subvolume ";
                    }

                    return prefix;
                }
            }

        };

        store.getFilterIndex = function(filterList, filter) {
            var len = filterList.length,
                i;

            for (i = 0; i < len; i++) {
                if (filterList[i].id === filter.id && filterList[i].value === filter.value) {
                    return i;
                }
            }
        };

    }

})();
