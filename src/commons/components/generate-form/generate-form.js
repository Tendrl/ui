(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("generateForm", generateForm);

    function generateForm() {

        return  {
                restrict: "E",

                scope: {
                    formAttributes: "=",
                    submitBtnName: "@",
                    postUrl: "@",
                    formMethod: "@",
                    callBack: "&",
                    clusterId: "@?"
                },

                replace: false,

                controller: function($scope, utils) {

                    $scope.performAction = function() {
                        $scope.requestData = $scope.manipulateData();
                        
                        utils.takeAction($scope.requestData, $scope.postUrl, $scope.formMethod, $scope.clusterId).then(function(responseObject) {
                            $scope.callBack({response: responseObject});
                        });
                        
                    };

                    $scope.manipulateData = function() {

                        var len = $scope.formAttributes.length,
                            requestData = {},
                            i;

                        for (i = 0; i < len ; i++) {
                            /* TODO :- ask api team to send Brick List */
                            if($scope.formAttributes[i].name === "Volume.bricks") {
                                var values = $scope.formAttributes[i].value.split(',');
                                requestData[$scope.formAttributes[i].name] = values;
                            } else {
                                requestData[$scope.formAttributes[i].name] = $scope.formAttributes[i].value;
                            }
                        }
                        return requestData;
                    }
                },
                template:   "<div class='container'>" +
                                "<div class='col-md-offset-1 col-md-10'>" +
                                    "<div class='common-form'>" + 
                                        "<form class='form-horizontal' role='form' ng-submit='performAction()'>" +
                                            "<div class='form-group' ng-repeat='attribute in formAttributes'>" + 
                                                "<label class='col-sm-3 control-label'>{{attribute.name}}" + 
                                                    "<span ng-if='attribute.required'> *</span>" +
                                                "</label>" +
                                                "<generate-form-field attribute-details='attribute' field-name='attribute.name'></generate-form-field>" +
                                            "</div>" +
                                            "<div class='form-group'>" + 
                                                "<div class='col-sm-6 col-sm-offset-3'>" + 
                                                    "<button type='submit' class='btn btn-primary btn-block'>{{submitBtnName}}</button>" +
                                                "</div>" +
                                            "</div>" + 
                                        "</form>" + 
                                    "</div>" +
                                "</div>" +
                            "</div>"
        }
    }

}());
