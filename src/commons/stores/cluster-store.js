(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($state, $q, $rootScope, nodeStore, clusterFactory) {
        var store = this;

        store.selectedTab = 1;

        /**
         * @name getClusterList
         * @desc store for GetClusterList
         * @memberOf clusterStore
         */
        store.getClusterList = function() {
            var deferred;

            deferred = $q.defer();
            clusterFactory.getClusterList()
                .then(function(data) {
                    //list = data ? _formatClusterData(data.clusters) : [];
                    $rootScope.clusterData = store.formatClusterData(data.clusters);
                    deferred.resolve(data.clusters);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        store.formatClusterData = function(data) {
            var len = data.length,
                res = [],
                temp = {},
                profileStatus = {
                    "enabled": "Enabled",
                    "disabled": "Disabled",
                    "mixed": "Mixed"
                },
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.integrationId = data[i].integration_id;
                temp.sdsVersion = data[i].sds_version;
                temp.sdsName = data[i].sds_name;
                temp.name = data[i].cluster_id;
                temp.clusterId = data[i].cluster_id;
                temp.isProfilingEnabled = profileStatus[data[i].volume_profiling_state];
                temp.jobStatus = data[i].status;
                temp.currentTask = data[i].current_job;
                temp.jobType = JSON.parse(data[i].current_job).job_name;
                temp.currentStatus = JSON.parse(data[i].current_job).status;
                temp.managed = data[i].is_managed === "yes" ? "Yes" : "No";
                temp.currentTaskId = JSON.parse(data[i].current_job).job_id;
                temp.volCount = data[i].globaldetails && data[i].globaldetails.vol_count ? parseInt(data[i].globaldetails.vol_count) : 0;
                temp.alertCount = data[i].alert_counters ? parseInt(data[i].alert_counters.warning_count) : 0;

                temp.errors = data[i].errors ? data[i].errors : [];

                if (temp.managed === "No") {
                    if ((!temp.errors.length) && temp.currentStatus === "failed") {
                        temp.message = "Cluster Misconfigured";
                    } else if (temp.currentStatus === "finished" || temp.currentTask === "{}") {
                        temp.message = "Ready to import";
                    }
                }
                if (temp.jobType === "ImportCluster") {
                    if (temp.currentStatus === "in_progress") {
                        temp.message = "Importing Cluster";
                    } else if (temp.currentStatus === "failed") {
                        temp.message = "Import Failed";
                    } else if (temp.currentStatus === "finished") {
                        temp.message = "Ready to Use";
                    }
                } else if (temp.jobType === "UnmanageCluster") {
                    temp.managed = "No";
                    if (temp.currentStatus === "in_progress") {
                        temp.message = "Unmanaging Cluster";
                    } else if (temp.currentStatus === "failed") {
                        temp.message = "Unmanage Failed";
                    } else if (temp.currentStatus === "finished") {
                        temp.message = "Ready to import";
                    }
                } else if (temp.managed === "Yes" && !temp.message) {
                    temp.message = "Ready to Use";
                }

                if (temp.managed === "Yes") {
                    if (temp.sdsName === "gluster") {
                        if (data[i].globaldetails && data[i].globaldetails.status === "healthy") {
                            temp.status = "HEALTH_OK";
                            temp.statusIcon = "Healthy";
                        } else if (data[i].globaldetails && data[i].globaldetails.status === "unhealthy") {
                            temp.status = "HEALTH_ERR";
                            temp.statusIcon = "Unhealthy";
                        } else {
                            temp.status = "NA";
                        }
                    } else {
                        temp.status = data[i].globaldetails ? data[i].globaldetails.status : "NA";

                        switch (temp.status) {

                            case "HEALTH_OK":
                                temp.statusIcon = "Healthy";
                                break;
                            case "HEALTH_ERR":
                                temp.statusIcon = "Unhealthy";
                                break;
                            case "HEALTH_WARN":
                                temp.statusIcon = "Warning";
                                break;
                        }
                    }
                }
                
                temp.hosts = store.getAssociatedHosts(data[i]);
                res.push(temp);
            }

            return res;
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
                temp = {};
                temp.nodeId = obj.node_id;
                temp.fqdn = obj.fqdn;
                temp.status = obj.status;
                tags = nodeStore.findRole(obj.tags);
                temp.role = tags ? tags.role : "None";
                temp.release = tags.release !== "NA" ? (tags.release + " " + data.sds_version) : "NA";
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
                    "Cluster.volume_profiling_flag": enableProfiling === "leaveAsIs" ? "leave-as-is" : enableProfiling
                },
                deferred;

            deferred = $q.defer();
            clusterFactory.importCluster(requestData, cluster.clusterId)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        /**
         * @name getClusterDetails
         * @desc return details of a cluster
         * @memberOf clusterStore
         */
        store.getClusterDetails = function(clusterId) {
            var clusterObj,
                clusterData,
                len,
                i;

            if ($rootScope.clusterData !== null && typeof clusterId !== "undefined") {
                clusterData = $rootScope.clusterData;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (clusterData[i].clusterId === clusterId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        /**
         * @name doProfilingAction
         * @desc enable/disable volume profile for cluster
         * @memberOf clusterStore
         */
        store.doProfilingAction = function(clusterId, action) {
            var deferred;

            deferred = $q.defer();
            clusterFactory.doProfilingAction(clusterId, action)
                .then(function(data) {
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        /**
         * @name doClusterUnmanage
         * @desc unmanages a cluster
         * @memberOf clusterStore
         */
        store.doClusterUnmanage = function(clusterId) {
            var sendData = {
                    "cluster_id": clusterId
                },
                deferred;

            deferred = $q.defer();
            clusterFactory.doClusterUnmanage(sendData, clusterId)
                .then(function(data) {
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };
    }

})();
