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
                    $rootScope.clusterData = store.formatClusterData(data.clusters);
                    deferred.resolve($rootScope.clusterData);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        /**
         * @name getCluster
         * @desc store for GetCluster
         * @memberOf clusterStore
         */
        store.getCluster = function(clusterId) {
            var deferred;

            deferred = $q.defer();
            clusterFactory.getCluster(clusterId)
                .then(function(data) {
                    data = _formatSingleCluster(data);
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        store.formatClusterData = function(data) {
            var len = data.length,
                res = [],
                i;

            for (i = 0; i < len; i++) {
                res.push(_formatSingleCluster(data[i]));
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
                temp.ipAddress = obj.ipv4_addr;
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
        store.importCluster = function(clusterId, enableProfiling, clusterName) {
            var requestData = {
                    "Cluster.volume_profiling_flag": enableProfiling === "leaveAsIs" ? "leave-as-is" : enableProfiling
                },
                deferred;

            if (clusterName) {
                requestData["Cluster.short_name"] = clusterName;
            }

            deferred = $q.defer();
            clusterFactory.importCluster(requestData, clusterId)
                .then(function(data) {
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
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

        /**
         * @name expandCluster
         * @desc expands a cluster
         * @memberOf clusterStore
         */
        store.expandCluster = function(clusterId) {
            var deferred;

            deferred = $q.defer();
            clusterFactory.expandCluster(clusterId)
                .then(function(data) {
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        /****Private Functions****/

        function _formatSingleCluster(cluster) {
            var temp = {};

            temp.integrationId = cluster.integration_id;
            temp.sdsVersion = cluster.sds_version;
            temp.sdsName = cluster.sds_name;
            temp.name = (cluster.short_name && cluster.short_name !== "None") ? cluster.short_name : cluster.integration_id;
            temp.clusterId = cluster.cluster_id;
            temp.currentTask = cluster.current_job || {};
            temp.jobType = temp.currentTask.job_name;
            temp.currentStatus = temp.currentTask.status;
            temp.managed = cluster.is_managed === "yes" ? "Yes" : "No";
            temp.currentTaskId = temp.currentTask.job_id;
            temp.volCount = cluster.globaldetails && cluster.globaldetails.vol_count ? parseInt(cluster.globaldetails.vol_count) : 0;
            temp.alertCount = cluster.alert_counters ? parseInt(cluster.alert_counters.alert_count) : 0;
            temp.hostCount = cluster.nodes.length || 0;
            temp.state = cluster.status;
            temp.isProfilingEnabled = _getProfileStatus(temp, cluster);

            temp.errors = cluster.errors ? cluster.errors : [];

            if (temp.managed === "No") {
                if ((!temp.errors.length) && temp.currentStatus === "failed") {
                    temp.message = "Cluster Misconfigured";
                } else if (temp.currentStatus === "finished" || temp.currentTask === {}) {
                    temp.message = "Ready to Import";
                }
            }
            if (temp.jobType === "ImportCluster") {
                if (temp.currentStatus === "in_progress") {
                    temp.message = "Importing Cluster";
                } else if (temp.currentStatus === "failed" && temp.errors.length) {
                    temp.message = "Import Failed";
                } else if (temp.currentStatus === "finished") {
                    if (temp.state === "expand_pending") {
                        temp.message = "Expansion required";
                    } else {
                        temp.message = "Ready to Use";
                    }
                }
            } else if (temp.jobType === "UnmanageCluster") {
                temp.managed = "No";
                if (temp.currentStatus === "in_progress") {
                    temp.message = "Unmanaging Cluster";
                } else if (temp.currentStatus === "failed") {
                    temp.message = "Unmanage Failed";
                } else if (temp.currentStatus === "finished") {
                    temp.message = "Ready to Import";
                }
            } else if (temp.managed === "Yes") {
                if (temp.jobType === "ExpandClusterWithDetectedPeers" && temp.currentStatus === "in_progress") {
                    temp.message = "Expanding cluster";
                } else if (temp.jobType === "ExpandClusterWithDetectedPeers" && temp.currentStatus === "failed") {
                    temp.message = "Expansion Failed";
                } else if (temp.state === "expand_pending") {
                    temp.message = "Expansion required";
                } else if (!temp.message) {
                    temp.message = "Ready to Use";
                }
            }

            if (temp.managed === "Yes") {
                if (temp.sdsName === "gluster") {
                    if (cluster.globaldetails && cluster.globaldetails.status === "healthy") {
                        temp.status = "HEALTH_OK";
                        temp.statusIcon = "Healthy";
                    } else if (cluster.globaldetails && cluster.globaldetails.status === "unhealthy") {
                        temp.status = "HEALTH_ERR";
                        temp.statusIcon = "Unhealthy";
                    } else {
                        temp.status = "NA";
                    }
                } else {
                    temp.status = cluster.globaldetails ? cluster.globaldetails.status : "NA";

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

            temp.hosts = store.getAssociatedHosts(cluster);
            return temp;
        }

        function _getProfileStatus(temp, cluster) {
            var status = "",
                profileStatus = {
                    "enabled": "Enabled",
                    "disabled": "Disabled",
                    "mixed": "Mixed"
                };

            if (temp.jobType === "EnableDisableVolumeProfiling" && temp.currentStatus === "in_progress") {
                status = "Pending";
            } else {
                status = profileStatus[cluster.volume_profiling_state];
            }

            return status;
        }
    }

})();
