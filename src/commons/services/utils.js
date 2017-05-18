(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("utils", utils);

    /*@ngInject*/
    function utils($http, $rootScope, $filter, config, AuthManager) {

        /* Cache the reference to this pointer */
        var vm = this,
            volumeList,
            hostList,
            poolList,
            i,
            index,
            key,
            clusterData,
            len,
            clusterObj;

        vm.takeAction = function(data, postUrl, formMethod, clusterId) {
            var url, actionRequest, request;

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + postUrl;
            } else {
                url = config.baseUrl + clusterId + "/" + postUrl;
            }

            if (formMethod === "PUT" || formMethod === "DELETE") {
                data._method = formMethod;
                formMethod = "POST";
            }

            actionRequest = {
                method: formMethod,
                url: url,
                data: data
            };

            request = angular.copy(actionRequest);

            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
            });
        };

        /* For object workflow service */
        vm.getObjectWorkflows = function(clusterId) {
            var url, objectWorkflowsRequest, request;

            if (clusterId === undefined || clusterId === "") {
                url = config.baseUrl + "Flows";
            } else {
                url = config.baseUrl + clusterId + "/Flows";
            }

            objectWorkflowsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(objectWorkflowsRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getObjectWorkflows");
                return null;
            });
        };

        vm.getObjectList = function(objectType, clusterId) {
            var url = "",
                getObjectListRequest, request;

            url = config.baseUrl + "Get" + objectType + "List";
            //url = "/api/GetClusterList.json";

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getObjectList");
                throw e;
            });
        };

        vm.getDashboardData = function(clusterType, utilization) {
            var url = "",
                getDashboardRequest,
                request;

            if (utilization) {
                url = config.baseUrl + "monitoring/system/" + clusterType + "/utilization";
            } else {
                url = config.baseUrl + "monitoring/system/" + clusterType;
            }

            getDashboardRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getDashboardRequest);
            return $http(request).then(function(response) {
                return response.data.stats;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getDashboardRequest");
            });
        }

        vm.getJobList = function() {
            var url = "",
                getJobListRequest,
                request;

            url = config.baseUrl + "jobs";

            getJobListRequest = {
                method: "GET",
                //url: "jobs"
                url: url
            };

            request = angular.copy(getJobListRequest);
            return $http(request).then(function(response) {
                return response.data.jobs;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getJobListRequest");
            });
        };

        vm.importCluster = function(uri, data) {
            var url,
                actionRequest,
                request;

            url = config.baseUrl + uri;

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };
            request = angular.copy(actionRequest);

            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
            });
        };

        vm.getClusterDetails = function(clusterId) {
            var clusterObj;

            if ($rootScope.clusterData !== null && typeof clusterId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (clusterData[i].cluster_id === clusterId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        vm.getJobDetail = function(id) {
            var url = "",
                getJobDetailRequest,
                request;

            url = config.baseUrl + "jobs/" + id;

            getJobDetailRequest = {
                method: "GET",
                url: url
                    // url: "/api/task-detail.json"
            };

            request = angular.copy(getJobDetailRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getJobDetailRequest");
            });
        };

        vm.getIntergrationDetails = function(intergrationId) {
            var clusterObj = {};

            if ($rootScope.clusterData !== null && typeof intergrationId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for (i = 0; i < len; i++) {
                    if (clusterData[i].intergration_id === intergrationId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        vm.getFileShareDetails = function(clusterId) {
            volumeList = [];

            if ($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for (i = 0; i < len; i++) {

                    if (typeof clusterData[i].volumes !== "undefined") {

                        if (clusterId !== undefined && clusterData[i].cluster_id === clusterId) {

                            for (index in clusterData[i].volumes) {
                                clusterData[i].volumes[index].cluster_id = clusterData[i].cluster_id;
                                volumeList.push(clusterData[i].volumes[index])
                            }

                        } else if (clusterId === undefined) {

                            for (index in clusterData[i].volumes) {
                                clusterData[i].volumes[index].cluster_id = clusterData[i].cluster_id;
                                volumeList.push(clusterData[i].volumes[index])
                            }
                        }
                    }

                }
            } else {
                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getFileShareDetails();
                });
            }
            return volumeList;
        };

        vm.getPoolDetails = function(clusterId) {
            poolList = [];

            if ($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (typeof clusterData[i].pools !== "undefined") {

                        if (clusterId !== undefined && clusterData[i].cluster_id === clusterId) {

                            for (index in clusterData[i].pools) {
                                clusterData[i].pools[index].cluster_id = clusterData[i].cluster_id;
                                poolList.push(clusterData[i].pools[index]);
                            }

                        } else if (clusterId === undefined) {

                            for (index in clusterData[i].pools) {
                                clusterData[i].pools[index].cluster_id = clusterData[i].cluster_id;
                                poolList.push(clusterData[i].pools[index]);
                            }
                        }
                    }
                }
            } else {

                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getPoolDetails();
                }).catch(function(error) {

                });
            }
            return poolList;
        };

        vm.getRBDsDetails = function(clusterId) {
            var rbdList = [],
                index1,
                index2;

            if ($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for (i = 0; i < len; i++) {

                    if (typeof clusterData[i].pools !== "undefined") {

                        if (clusterId !== undefined && clusterData[i].cluster_id === clusterId) {

                            for (index1 in clusterData[i].pools) {
                                if (typeof clusterData[i].pools[index1].rbds !== "undefined") {
                                    for (index2 in clusterData[i].pools[index1].rbds) {
                                        clusterData[i].pools[index1].rbds[index2].clusterName = clusterData[i].name;
                                        clusterData[i].pools[index1].rbds[index2].clusterId = clusterData[i].cluster_id;
                                        clusterData[i].pools[index1].rbds[index2].backingPool = clusterData[i].pools[index1].pool_name;
                                        clusterData[i].pools[index1].rbds[index2].pool_id = clusterData[i].pools[index1].pool_id;
                                        clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = false;
                                        if (Object.keys(clusterData[i].pools[index1].rbds).length > 1) {
                                            clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = true;
                                        }
                                        rbdList.push(clusterData[i].pools[index1].rbds[index2]);
                                    }
                                }
                            }

                        } else if (clusterId === undefined) {

                            for (index1 in clusterData[i].pools) {
                                if (typeof clusterData[i].pools[index1].rbds !== "undefined") {
                                    for (index2 in clusterData[i].pools[index1].rbds) {
                                        clusterData[i].pools[index1].rbds[index2].clusterName = clusterData[i].name;
                                        clusterData[i].pools[index1].rbds[index2].clusterId = clusterData[i].cluster_id;
                                        clusterData[i].pools[index1].rbds[index2].backingPool = clusterData[i].pools[index1].pool_name;
                                        clusterData[i].pools[index1].rbds[index2].pool_id = clusterData[i].pools[index1].pool_id;
                                        clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = false;
                                        if (Object.keys(clusterData[i].pools[index1].rbds).length > 1) {
                                            clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = true;
                                        }
                                        rbdList.push(clusterData[i].pools[index1].rbds[index2]);
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                vm.getObjectList("Cluster").then(function(list) {
                    $rootScope.clusterData = list;
                    vm.getRBDsDetails();
                });
            }
            return rbdList;
        };

        vm.getAssociatedHosts = function(hostListArray, clusterId) {
            hostList = [];
            len = hostListArray.length;
            for (i = 0; i < len; i++) {
                if (hostListArray[i].tendrlcontext.integration_id === clusterId) {
                    hostList.push(hostListArray[i]);
                }
            }
            return hostList;
        };

        vm.convertToBytes = function(value, unit) {
            if (unit === "KB") {
                return value * Math.pow(1024, 1);
            } else if (unit === "MB") {
                return value * Math.pow(1024, 2);
            } else if (unit === "GB") {
                return value * Math.pow(1024, 3);
            } else if (unit === "TB") {
                return value * Math.pow(1024, 4);
            } else if (unit === "PB") {
                return value * Math.pow(1024, 5);
            } else {
                return value;
            }
        };

        vm.checkErrorCode = function(e) {
            if (e.status === 401) {
                AuthManager.handleUnauthApi();
            }
        };

        vm.formatDate = function(list, property, format) {
            var len = list.length,
                i;

            for (i = 0; i < len; i++) {
                list[i][property] = $filter("date")(list[i][property], format);
            }

            return list;
        }

        vm.getTaskLogs = function(jobId) {
            var url,
                getTaskLogsRequest,
                request;

            url = config.baseUrl + "jobs/" + jobId + "/messages";
            //url = "/api/GetMessageList.json";

            getTaskLogsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskLogsRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

        vm.getTaskStatus = function(jobId) {
            var url,
                getTaskStatusRequest,
                request;

            url = config.baseUrl + "jobs/" + jobId + "/status";
            //url = "/api/GetStatus.json";

            getTaskStatusRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskStatusRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

        vm.getTaskOutput = function(jobId) {
            var url, getTaskOutputRequest, request;

            url = config.baseUrl + "jobs/" + jobId + "/output";
            //url = "/api/GetStatus.json";

            getTaskOutputRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskOutputRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

        vm.generateJournalConf = function(requestData) {
            var url, getJournalConfRequest, request;

            //url = "/api/journal-details.json";
            url = config.baseUrl + "GenerateJournalMapping";

            getJournalConfRequest = {
                method: "POST",
                url: url,
                data: requestData
            };

            request = angular.copy(getJournalConfRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

        vm.getAlertList = function() {
            var url,
                getAlertListRequest,
                request;

            //url = "/api/alerts.json";
            url = config.baseUrl + "alerts";

            getAlertListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getAlertListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getAlertList");
                return null;
            });
        };

        vm.getAlertSeverityList = function(list) {
            var filteredList = {};

            filteredList.warningAlerts = $filter("filter")(list, { severity: "warning" });
            filteredList.errorAlerts = $filter("filter")(list, { severity: "error" });
            filteredList.infoAlerts = $filter("filter")(list, { severity: "info" });
            return filteredList;
        };

        vm.getNotificationList = function() {
            var url,
                getNotificationListRequest,
                request;

            //url = "/api/notification.json";
            url = config.baseUrl + "notifications";

            getNotificationListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getNotificationListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getNotificationList");
                return null;
            });
        };

        vm.getClusterDashboardList = function(id, componentType, type) {
            var url,
                getClusterDashboardListRequest,
                request;

            if (type === "public_network" || type === "cluster_network") {
                url = config.baseUrl + "monitoring/" + componentType + "/" + id + "/throughput?type=" + type;
            } else if (type) {
                url = config.baseUrl + "monitoring/" + componentType + "/" + id + "/" + type;
            } else {
                url = config.baseUrl + "monitoring/" + componentType + "/" + id;
            }

            getClusterDashboardListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getClusterDashboardListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getOverviewData");
                return null;
            });
        };

        vm.createCluster = function(postData) {
            var url, createClusterRequest, request;

            url = config.baseUrl + "CreateCluster";

            createClusterRequest = {
                method: "POST",
                url: url,
                data: postData
            };

            request = angular.copy(createClusterRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while createCluster");
                return null;
            });
        };

        vm.createBrick = function(data, cluster) {
            var url, actionRequest, request;

            url = config.baseUrl + cluster.cluster_id + "/GlusterCreateBrick";

            actionRequest = {
                method: "POST",
                url: url,
                data: data
            };
            request = angular.copy(actionRequest);

            return $http(request).then(function (response) {
                return response.data;
            }, function(e) {
                checkErrorCode(e);
            });
        };

        vm.getClusterDashboardList = function(id, componentType, type) {
            var url, getClusterDashboardListRequest, request;
                if(type === "public_network" || type === "cluster_network"){
                    url = config.baseUrl + "monitoring/" + componentType + "/" + id + "/throughput?type=" + type;
                } else if(type) {
                    url = config.baseUrl + "monitoring/" + componentType + "/" + id + "/" + type;
                } else {
                    url = config.baseUrl + "monitoring/" + componentType + "/" + id;
                }

                getClusterDashboardListRequest = {
                    method: "GET",
                    url: url
                };

                request = angular.copy(getClusterDashboardListRequest);
                return $http(request).then(function (response) {
                    return response.data;
                }, function(e) {
                    checkErrorCode(e);
                    console.log("Error Occurred: while fetching getOverviewData");
                    return null;
                });
        };

    };
})();
