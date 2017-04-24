(function () {
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

            return $http(request).then(function (response) {
                return response.data;
            },function(e) {
                checkErrorCode(e);
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
            return $http(request).then(function (response) {
                return response.data;
            }, function(e) {
                checkErrorCode(e);
                console.log("Error Occurred: while fetching getObjectWorkflows");
                return null;
            }); 
        };

        vm.getObjectList= function(objectType, clusterId) {
            var url = "", getObjectListRequest, request;

            // will comment out once API is available
            // if (clusterId === undefined || clusterId === "") {
            //     url = config.baseUrl + "Get" + objectType +"List";
            // }

            url = config.baseUrl + "Get" + objectType +"List";
            //url = "/api/GetClusterList.json";

            // // For testing purpose
            // if(objectType === "trends-chart") {
            //     url = "/api/trends-chart.json";
            // } else if(objectType === "bar-chart") {
            //     url = "/api/bar-chart.json";
            // } else if(objectType === "heat-map") {
            //     url = "/api/heat-map.json";
            // } else if(objectType === "Disk") {
            //     url = "/api/GetDiskList.json";   
            // }

            getObjectListRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getObjectListRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function(e) {
                checkErrorCode(e);
                console.log("Error Occurred: while fetching getObjectList");
                throw e;
            });
        };

        vm.getJobList = function() {
            var url = "", getJobListRequest, request;

            url = config.baseUrl + "jobs";

            getJobListRequest = {
                method: "GET",
                //url: "jobs"
                url: url
            };

            request = angular.copy(getJobListRequest);
            return $http(request).then(function (response) {
                return response.data.jobs;
            }, function(e) {
                checkErrorCode(e);
                console.log("Error Occurred: while fetching getJobListRequest");
            });
        };

        vm.importCluster = function(uri, data) {
            var url, actionRequest, request;

            url = config.baseUrl + uri;

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

        vm.getClusterDetails = function(clusterId) {
            var clusterObj;

            if($rootScope.clusterData !== null && typeof clusterId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++ ) {

                    if(clusterData[i].cluster_id === clusterId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        vm.getJobDetail = function(id) {
            var url = "", getJobDetailRequest, request;

            url = config.baseUrl + "jobs/" + id ;

            getJobDetailRequest = {
                method: "GET",
                url: url
                // url: "/api/task-detail.json"
            };

            request = angular.copy(getJobDetailRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function(e) {
                checkErrorCode(e);
                console.log("Error Occurred: while fetching getJobDetailRequest");
            });
        };

        vm.getIntergrationDetails = function(intergrationId) {
            var clusterObj = {};

            if($rootScope.clusterData !== null && typeof intergrationId !== "undefined") {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for ( i = 0; i < len; i++ ) {
                    if(clusterData[i].intergration_id === intergrationId) {
                        clusterObj = clusterData[i];
                        break;
                    }
                }
            }

            return clusterObj;
        };

        vm.getFileShareDetails = function(clusterId) {
            volumeList = [];

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;
                for ( i = 0; i < len; i++ ) {

                    if(typeof clusterData[i].volumes !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index in clusterData[i].volumes) {
                                clusterData[i].volumes[index].cluster_id = clusterData[i].cluster_id;
                                volumeList.push(clusterData[i].volumes[index])
                            }

                        } else if(clusterId === undefined) {

                            for(index in clusterData[i].volumes) {
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

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++) {

                    if(typeof clusterData[i].pools !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index in clusterData[i].pools) {
                                clusterData[i].pools[index].cluster_id = clusterData[i].cluster_id;
                                poolList.push(clusterData[i].pools[index]);
                            }

                        } else if(clusterId === undefined) {

                            for(index in clusterData[i].pools) {
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
            var rbdList = [], index1, index2;

            if($rootScope.clusterData !== null) {
                clusterData = $rootScope.clusterData.clusters;
                len = clusterData.length;

                for ( i = 0; i < len; i++ ) {

                    if(typeof clusterData[i].pools !== "undefined") {

                        if(clusterId !== undefined && clusterData[i].cluster_id === clusterId) {
                               
                            for(index1 in clusterData[i].pools) {
                                if(typeof clusterData[i].pools[index1].rbds !== "undefined") {
                                    for(index2 in clusterData[i].pools[index1].rbds) {
                                        clusterData[i].pools[index1].rbds[index2].clusterName = clusterData[i].name;
                                        clusterData[i].pools[index1].rbds[index2].clusterId = clusterData[i].cluster_id;
                                        clusterData[i].pools[index1].rbds[index2].backingPool = clusterData[i].pools[index1].pool_name;
                                        clusterData[i].pools[index1].rbds[index2].pool_id = clusterData[i].pools[index1].pool_id;
                                        clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = false;
                                        if(Object.keys(clusterData[i].pools[index1].rbds).length>1) {
                                            clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = true;
                                        }
                                        rbdList.push(clusterData[i].pools[index1].rbds[index2]);
                                    }
                                }
                            }

                        } else if(clusterId === undefined) {

                            for(index1 in clusterData[i].pools) {
                                if(typeof clusterData[i].pools[index1].rbds !== "undefined") {
                                    for(index2 in clusterData[i].pools[index1].rbds) {
                                        clusterData[i].pools[index1].rbds[index2].clusterName = clusterData[i].name;
                                        clusterData[i].pools[index1].rbds[index2].clusterId = clusterData[i].cluster_id;
                                        clusterData[i].pools[index1].rbds[index2].backingPool = clusterData[i].pools[index1].pool_name;
                                        clusterData[i].pools[index1].rbds[index2].pool_id = clusterData[i].pools[index1].pool_id;
                                        clusterData[i].pools[index1].rbds[index2].isBackingPoolShared = false;
                                        if(Object.keys(clusterData[i].pools[index1].rbds).length>1) {
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
            for ( i = 0; i < len; i++ ) {
                if(hostListArray[i].tendrlcontext.integration_id === clusterId) {
                    hostList.push(hostListArray[i]);
                }
            }
            return hostList;
        };

        vm.convertToBytes = function(value, unit) {
            if(unit === "KB") {
                return value * Math.pow(1024,1);
            }else if(unit === "MB") {
                return value * Math.pow(1024,2);
            }else if(unit === "GB") {
                return value * Math.pow(1024,3);
            }else if(unit === "TB") {
                return value * Math.pow(1024,4);
            }else if(unit === "PB") {
                return value * Math.pow(1024,5);
            } else {
                return value;
            }
        };

        var checkErrorCode = function(e){
            if(e.status === 401){
                AuthManager.handleUnauthApi();
            }
        };
        
        vm.formatDate = function (list, property, format) {
            var len = list.length,
                i;

            for(i = 0; i < len; i++) {
                list[i][property] = $filter("date")(list[i][property], format);
            }

            return list;
        }

        vm.getTaskLogs = function(jobId) {
            var url, getTaskLogsRequest, request;

            url = config.baseUrl + "jobs/"  + jobId + "/messages";
            //url = "/api/GetMessageList.json";

            getTaskLogsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskLogsRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

        vm.getTaskStatus = function(jobId) {
            var url, getTaskStatusRequest, request;

            url = config.baseUrl + "jobs/"  + jobId + "/status";
            //url = "/api/GetStatus.json";

            getTaskStatusRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getTaskStatusRequest);
            return $http(request).then(function (response) {
                return response.data;
            }, function() {
                console.log("Error Occurred: while fetching getTaskLogs");
                return null;
            });
        };

        vm.getEventList = function() {
            var url, getEventListRequest, request;

                url = "/api/alerts.json";

                getEventListRequest = {
                    method: "GET",
                    url: url
                };

                request = angular.copy(getEventListRequest);
                return $http(request).then(function (response) {
                    return response.data;
                }, function() {
                    console.log("Error Occurred: while fetching getTaskLogs");
                    return null;
                });
        };
    };
    
})();