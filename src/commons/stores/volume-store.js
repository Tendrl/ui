(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("volumeStore", volumeStore);

    /*@ngInject*/
    function volumeStore($state, $q, $rootScope, $stateParams, utils, nodeStore, volumeFactory) {
        var store = this;

        store.volumeList = [];
        /**
         * @name getVolumeList
         * @desc store for getVolumeList
         * @memberOf volumeStore
         */
        store.getVolumeList = function(clusterId) {
            var list,
                deferred;

            deferred = $q.defer();
            volumeFactory.getVolumeList(clusterId)
                .then(function(data) {
                    list = data ? _formatVolumeData(data) : [];
                    store.volumeList = list;
                    deferred.resolve(list);
                });

            return deferred.promise;

            function _formatVolumeData(data) {
                var volumeList = [],
                    len = data.length,
                    temp = {},
                    i;

                for (i = 0; i < len; i++) {
                    temp = {};
                    if (data[i].deleted !== "True") {
                        temp.volumeId = data[i].vol_id;
                        //temp.status = data[i].status !== "Stopped" ? "Running": data[i].status;
                        temp.state = data[i].state;
                        temp.status = data[i].status;
                        temp.name = data[i].name;
                        temp.type = data[i].vol_type;
                        temp.rebalStatus = data[i].rebal_status;
                        temp.brickCount = data[i].brick_count;
                        temp.alertCount = data[i].alert_counters ? data[i].alert_counters.alert_count : "No Data";
                        temp.currentTask = data[i].current_job || {};
                        temp.profileStatus = _getProfileStatus(temp);
                        volumeList.push(temp);
                    }
                }
                return volumeList;

                function _getProfileStatus(volume) {
                    var profileStatus = "",
                        profileStatusMap = {
                            "yes": "Enabled",
                            "no": "Disabled"
                        };

                    if (volume.currentTask && volume.currentTask.status === "in_progress" && (volume.currentTask.job_name === "StopProfiling" || volume.currentTask.job_name === "StartProfiling")) {
                        profileStatus = "Pending";
                    } else {
                        profileStatus = profileStatusMap[data[i].profiling_enabled];

                        if (typeof profileStatus === "undefined") {
                            profileStatus = "Unknown";
                        }
                    }

                    return profileStatus;
                }
            }
        };

        /**
         * @name getRebalStatus
         * @desc returns rebalance status text
         * @memberOf volumeStore
         */
        store.getRebalStatus = function(volume) {
            switch (volume.rebalStatus) {
                case "completed":
                    return "Completed";
                    break;

                case "not_started":
                case "not started":
                    return "Not Started";
                    break;

                case "in progress":
                case "in_progress":
                    return "In Progress";
                    break;

                case "failed":
                    return "Failed";
                    break;

                case "stopped":
                    return "Stopped";
                    break;

                default:
                    return "NA";
            }
        };

        store.getVolumeObject = function(volId) {
            var len = store.volumeList.length,
                i;

            for (i = 0; i < len; i++) {
                if (store.volumeList[i].volumeId === volId) {
                    return store.volumeList[i];
                }
            }

            return null;

        };

        store.toggleProfiling = function(volume, action, clusterId) {
            var deferred;

            deferred = $q.defer();
            volumeFactory.toggleProfiling(volume, action, clusterId)
                .then(function(data) {
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

    }

})();
