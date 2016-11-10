(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("generateForm", generateForm);

    function generateForm() {

        return  {
                restrict: "E",

                scope: {
                    formAttributes: "=",
                    submitBtnName: "@"
                },

                replace: false,

                controller: function($scope, utils, config) {

                    $scope.showClose = false;

                    $scope.performAction = function() {
                        $scope.requestData = $scope.manipulateData();

                        utils.takeAction($scope.requestData).then(function(jobObject) {
                            alert("Volume is created successfully. and JOB-ID is - " + jobObject.job_id + " And Volume creation is " + jobObject.status);
                        });
                        
                    };

                    $scope.manipulateData = function() {
                        var keys = Object.keys($scope.formAttributes),
                            len = keys.length,
                            requestData = {},
                            i;

                        for (i = 0; i < len; i++) {
                            requestData[keys[i]] = $scope.formAttributes[keys[i]].value;
                        }

                        return requestData;
                    }
                },
                template:   "<div class='container'>" +
                                "<div class='col-md-offset-2 col-md-8'>" +
                                    "<div class='common-form'>" + 
                                        "<form class='form-horizontal' role='form' ng-submit='performAction()'>" +
                                            "<div class='form-group' ng-repeat='(key, attribute) in formAttributes'>" + 
                                                "<label class='col-sm-3 control-label'>{{key}}</label>" + 
                                                "<generate-form-field attribute-details='attribute' field-name='key'></generate-form-field>" +
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
