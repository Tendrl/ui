(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.component("generateForm", {
            restrict: "E",
            bindings: {
                formAttributes: "=",
                submitBtnName: "@"
            },
            replace: false,
            controller: function(formSubmitService) {
                var vm = this, 
                    requestData;
                vm.performAction = function() {
                    requestData = _manipulateData(vm.formAttributes);
                    formSubmitService.saveFormData('f82409b8-b5ba-4f91-8486-e0294193268e', 'volume', requestData).then(function(jobObject) {
                          alert("Volume is created successfully. and JOB-ID is - " + jobObject.job_id + "And Volume creation is in " + jobObject.status);
                    });
                    
                };
                function _manipulateData(formAttributes) {
                    var keys = Object.keys(formAttributes),
                        len = keys.length,
                        i;
                    requestData = {}
                    for (i = 0; i < len; i++) {
                        requestData[keys[i]] = formAttributes[keys[i]].value;
                    }
                    return requestData;
                }
            },
            controllerAs : "generateFormCtrl",
            template:   "<div class='container'>" +
                            "<div class='col-md-offset-2 col-md-8'>" +
                                "<div class='common-form'>" + 
                                    "<form class='form-horizontal' role='form' ng-submit='generateFormCtrl.performAction()'>" +
                                        "<div class='form-group' ng-repeat='(key, attribute) in generateFormCtrl.formAttributes'>" + 
                                            "<label class='col-sm-3 control-label'>{{key}}</label>" + 
                                            "<generate-form-field attribute-details='attribute' field-name='key'></generate-form-field>" +
                                        "</div>" +
                                        "<div class='form-group'>" + 
                                            "<div class='col-sm-6 col-sm-offset-3'>" + 
                                                "<button type='submit' class='btn btn-primary btn-block'>{{generateFormCtrl.submitBtnName}}</button>" +
                                            "</div>" +
                                        "</div>" + 
                                    "</form>" + 
                                "</div>" +
                            "</div>" +
                        "</div>"
    });

}());
