(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("clusterStore", clusterStore);

    /*@ngInject*/
    function clusterStore($state, $filter, $q, $rootScope, peerStore, volumeFactory, clusterFactory) {
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

                    //Required to make the event listen in header.js file
                    $rootScope.$broadcast("GotClusterData", $rootScope.clusterData);

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
                nodes = data.nodes,
                len = nodes.length,
                tags,
                temp,
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.nodeId = nodes[i].node_id;
                temp.fqdn = nodes[i].fqdn;
                temp.status = nodes[i].status;
                temp.managed = nodes[i].is_managed === "yes" ? "Yes" : "No";
                temp.ipAddress = nodes[i].ipv4_addr;
                tags = peerStore.findRole(nodes[i].tags);
                temp.role = tags ? tags.role : "None";
                temp.release = tags.release !== "NA" ? (tags.release + " " + data.sds_version) : "NA";

                hostList.push(temp);
            }

            return hostList;
        };

        /**
         * @name importCluster
         * @desc store for import cluster
         * @memberOf clusterStore
         */
        store.importCluster = function(gd2Url, secret, clusterName) {
            var requestData = {
                    "gd2_url": gd2Url,
                    "secret": secret
                },
                deferred;

            if (clusterName) {
                requestData["short_name"] = clusterName;
            }

            deferred = $q.defer();
            clusterFactory.importCluster(requestData)
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
            var temp = {},
                sdsMapping;

            sdsMapping = {
                "gluster": "Gluster",
                "rhgs": "RHGS"
            };

            temp.integrationId = cluster['cluster-id'];
            temp.sdsVersion = cluster.version;
            temp.sdsName = 'gluster'; // TODO cluster.sds_name;
            temp.showSdsName = sdsMapping[temp.sdsName.toLowerCase()];
            temp.name = (cluster.short_name && cluster.short_name !== "None") ? cluster.short_name : cluster['cluster-id'];
            temp.clusterId = cluster['cluster-id'];
            temp.currentTask = cluster.current_job || {};
            temp.jobType = temp.currentTask.job_name;
            temp.currentStatus = temp.currentTask.status;
            temp.managed = "Yes"; // cluster.is_managed === "yes" ? "Yes" : "No";
            temp.currentTaskId = temp.currentTask.job_id;
            //temp.volCount = cluster.globaldetails && cluster.globaldetails.vol_count ? parseInt(cluster.globaldetails.vol_count) : 0;
            temp.volCount = cluster.volumes.length;
            temp.alertCount = cluster.alert_counters ? parseInt(cluster.alert_counters.alert_count) : 0;
            temp.hostCount = cluster.peers.length;
            temp.state = 'healthy';//cluster.status;
            temp.isProfilingEnabled = 'TODO'// TODO - derive this from volumes store, aggregate profiling statuses of volumes as yes, no, mixed - _getProfileStatus(temp, cluster);
            temp.readyState = false;

            temp.hosts = []; // TODO store.getAssociatedHosts(cluster);
            temp.isAnyHostUnmanaged = []; //nodeStore.isAnyHostUnmanaged(temp.hosts);

            temp.errors = cluster.errors ? cluster.errors : [];

            /*This block has be placed here, as it initializes statusIcon (used at line 283)*/
            // TODO - also hit peers, volumes, devices stores, find if any 
            if (temp.managed === "Yes") {
                if (temp.state === "healthy") {
                    temp.status = "HEALTH_OK";
                    temp.statusIcon = "Healthy";
                } else if (temp.state === "unhealthy") {
                    temp.status = "HEALTH_ERR";
                    temp.statusIcon = "Unhealthy";
                } else {
                    temp.status = "NA";
                }
            } else {
                temp.statusIcon = "Cluster status is unknown. Import is required to monitor the cluster.";
            }

            if (temp.managed === "No") {
                if ((!temp.errors.length) && temp.currentStatus === "failed") {
                    temp.message = "Cluster Misconfigured";
                } else if (temp.currentStatus === "finished" || JSON.stringify(temp.currentTask) === "{}") {
                    temp.message = "Ready to Import";
                }
            }
            if (temp.jobType === "ImportCluster") {
                if (temp.currentStatus === "in_progress") {
                    temp.message = "Importing Cluster.";
                } else if (temp.currentStatus === "failed" && temp.errors.length) {
                    temp.message = "Import Failed.";
                } else if (temp.currentStatus === "finished") {
                    if (temp.state === "expand_pending") {
                        temp.message = "Expansion required";
                    } else {
                        temp.message = "Ready to Use";
                        temp.readyState = true;
                    }
                }
            } else if (temp.jobType === "UnmanageCluster") {
                temp.managed = "No";
                if (temp.currentStatus === "in_progress") {
                    temp.message = "Unmanaging Cluster.";
                } else if (temp.currentStatus === "failed") {
                    temp.message = "Unmanage Failed.";
                } else if (temp.currentStatus === "finished") {
                    temp.message = "Ready to Import";
                }
            } else if (temp.managed === "Yes") {

                if (temp.isAnyHostUnmanaged) {
                    //temp.message = "Expansion required";
                }

                if (temp.jobType === "ExpandClusterWithDetectedPeers" && temp.currentStatus === "in_progress") {
                    temp.message = "Expanding Cluster.";
                    temp.statusIcon = "Expand cluster in progress";
                } else if (temp.jobType === "ExpandClusterWithDetectedPeers" && temp.currentStatus === "failed") {
                    temp.message = "Expansion Failed.";
                } else if (temp.state === "expand_pending") {
                    temp.message = "Expansion required";
                } else if (!temp.message) {
                    temp.message = "Ready to Use";
                    temp.readyState = true;
                }
            }

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

                if (typeof status === "undefined") {
                    status = "Unknown";
                }
            }

            return status;
        }
    }

})();
