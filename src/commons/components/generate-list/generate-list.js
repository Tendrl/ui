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

                controller: function($scope, $rootScope, $interval, utils) {

                    // initialization all scope variable
                    $scope.isCreateFormShow = false;
                    $scope.list = [];
                    $scope.flows = [];
                    $scope.createFlow = {};

                    $scope.init = function() {
                        utils.getObjectList($scope.listName, $scope.objectId).then(function(list) {
                            $scope.list = list;
                            // Now get the object flows so that we will have actions for objects
                            utils.getObjectWorkflows($scope.objectId).then(function(flows) {
                                $scope.flows = flows;                         
                            });
                        });
                    }

                    $scope.init();

                    /*Refreshing list after each 30 second interval*/
                    $interval(function () {
                      $scope.init();
                    }, 1000*30);

                    $scope.createAction = function() {
                        var len = $scope.flows.length,
                            i;

                        for (i = 0; i < len ; i++) {
                            if($scope.flows[i].name.indexOf("Create")) {
                                $scope.isCreateFormShow = true;
                                $scope.createFlow = $scope.flows[i];
                                break;
                            }
                        }
                    }

                    $scope.actionPerform = function(actionName, obj) {
                        var len = $scope.flows.length,
                            i, selectedFlow = {}, requestData = {};

                        for (i = 0; i < len ; i++) {
                            if($scope.flows[i].name.indexOf(actionName) != -1) {
                                selectedFlow = $scope.flows[i];
                                var length = selectedFlow.attributes.length,
                                    j;
                                for (j = 0; j < length ; j++) {
                                    if( (selectedFlow.attributes[j].name).indexOf("id") != -1 ) {
                                        requestData[selectedFlow.attributes[j].name] = obj.vol_id;
                                    } else if(selectedFlow.attributes[j].name.indexOf("name") != -1 ){
                                        requestData[selectedFlow.attributes[j].name] = obj.name;
                                    }
                                }
                            }
                        }
                        
                        utils.takeAction(requestData, selectedFlow.name, selectedFlow.method, $scope.objectId).then(function(response) {
                            $rootScope.notification.type = "success";
                            $rootScope.notification.message = $scope.listName + " " + actionName + " action performed successfully. and JOB-ID is - " + response.job_id;
                        });

                    }

                    $scope.callBack = function(response) {
                        $rootScope.notification.type = "success";
                        $rootScope.notification.message = $scope.listName + " is created successfully. and JOB-ID is - " + response.job_id;
                        $scope.isCreateFormShow = false;
                    }
                    
                },

                templateUrl: "/commons/components/generate-list/generate-list.html"
        }
    }

}());
