(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("utils", utils);

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

        vm.getObjectList = function(objectType, clusterId) {
            var url = "",
                getObjectListRequest, request;

            url = config.baseUrl + "Get" + objectType + "List";

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

        vm.getUserList = function(){
            var url,
                getUserRequest,
                request;

            //url = config.baseUrl + "jobs/" + jobId + "/messages";
            url = "/api/GetUserList.json";

            getUserRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getUserRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching getUserList");
                return null;
            });

        }

        vm.ClusterIOPS = function(cluster_id, timeInterval) {
            var url = "",
                getObjectListRequest, request;

            url = config.baseUrl + "monitoring/clusters/iops?cluster_ids=" + cluster_id + "&interval=" + timeInterval;

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                vm.checkErrorCode(e);
                console.log("Error Occurred: while fetching Cluster IOPS");
                return null;
            });
        };
    };
})();
