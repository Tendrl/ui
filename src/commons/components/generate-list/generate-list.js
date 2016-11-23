(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("generateList", generateList);

    function generateList() {

        return  {
                restrict: "E",

                scope: {
                    listName: "@",
                    objectId: "@?"
                },

                replace: false,

                controller: function($scope, $rootScope, $interval, utils, config) {

                    /* initialization all scope variable */
                    $scope.isCreateFormShow = false;
                    $scope.flows = [];
                    $scope.createFlow = {};

                    /* Now get the object flows */
                    utils.getObjectWorkflows($scope.objectId).then(function(flows) {
                        $scope.flows = flows;
                        var len = $scope.flows.length,
                            i;
                        /* Segregating create flow form all flows */
                        for (i = 0; i < len ; i++) {
                            if($scope.flows[i].name.indexOf("Create")) {
                                $scope.createFlow = $scope.flows[i];
                                break;
                            }
                        }
                    });

                    $scope.init = function() {
                        utils.getObjectList($scope.listName, $scope.objectId).then(function(list) {
                            $scope.list = [];
                            if(list !== null) {
                                var len = list.length,
                                    i,key;
                                /* Todo:- Removing DELETE items from the list */
                                for (i = 0; i < len ; i++) {
                                    if(list[i].deleted !=='True') {
                                        $scope.list.push(list[i]);
                                    }
                                }
                            }
                        });
                    }

                    $scope.init();

                    /*Refreshing list after each 30 second interval*/
                    var timer = $interval(function () {
                      $scope.init();
                    }, 1000 * config.refreshIntervalTime );

                    /*Cancelling interval when scope is destroy*/
                    $scope.$on('$destroy', function() {
                        $interval.cancel(timer);
                    });

                    $scope.createAction = function() {
                        $scope.isCreateFormShow = true;
                    }

                    $scope.actionPerform = function(actionName, obj) {
                        var len = $scope.flows.length,
                            i, selectedFlow = {}, requestData = {}, objId, objName, objVersion;

                        /* Setting up objId, objName, objVersion */
                        for(var key in obj) {
                            if(key.indexOf("id") !== -1 && key.indexOf("cluster") === -1) {
                                objId = obj[key];
                            } else if(key.indexOf("name") !== -1 && key.indexOf("host") === -1) {
                                objName = obj[key];
                            } else if(key.indexOf("version") !== -1) {
                                objVersion = obj[key];
                            }
                        }

                        /* Setting up request data */
                        for (i = 0; i < len ; i++) {
                            if($scope.flows[i].name.indexOf(actionName) !== -1) {
                                selectedFlow = $scope.flows[i];
                                var length = selectedFlow.attributes.length,
                                    j;
                                for (j = 0; j < length ; j++) {
                                    if( (selectedFlow.attributes[j].name).indexOf("id") !== -1 ) {
                                        requestData[selectedFlow.attributes[j].name] = objId;
                                    } else if(selectedFlow.attributes[j].name.indexOf("name") !== -1 ){
                                        requestData[selectedFlow.attributes[j].name] = objName;
                                    } else if(selectedFlow.attributes[j].name.indexOf("version") !== -1 ){
                                        requestData[selectedFlow.attributes[j].name] = objVersion;
                                    }
                                }
                            }
                        }
                        
                        /* Performing the appropriate action */
                        utils.takeAction(requestData, selectedFlow.name, selectedFlow.method, $scope.objectId).then(function(response) {
                            $rootScope.notification.type = "success";
                            $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                        });

                    }

                    $scope.callBack = function(response) {
                        $rootScope.notification.type = "success";
                        $rootScope.notification.message = "JOB is under process. and JOB-ID is - " + response.job_id;
                        $scope.isCreateFormShow = false;
                    }
                    
                },

                templateUrl: "/commons/components/generate-list/generate-list.html"
        }
    }

}());