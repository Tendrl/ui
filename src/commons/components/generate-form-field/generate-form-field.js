(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.component("generateFormField", {
            restrict: "E",
            bindings: {
                attributeDetails: "=",
                fieldName: "@"
            },
            replace: false,
            controller: function() {
                var vm = this;
                if(vm.attributeDetails.type === "Brick[]") {
                    vm.listOptions = [{
                        "name": "brick1",
                        "value": "brick1"
                    }, {
                        "name": "brick2",
                        "value": "brick2"
                    }, {
                        "name": "brick3",
                        "value": "brick3"
                    }];
                }

            },
            controllerAs : "generateFormFieldCtrl",
            template:   "<div class='col-sm-6'>" +
                            "<input type='text' class='form-control' name='{{generateFormFieldCtrl.fieldName}}' ng-if='generateFormFieldCtrl.attributeDetails.type === \"String\"' ng-model='generateFormFieldCtrl.attributeDetails.value' required>" +
                            "<input type='number' class='form-control' name='{{generateFormFieldCtrl.fieldName}}' ng-if='generateFormFieldCtrl.attributeDetails.type === \"Integer\"' ng-model='generateFormFieldCtrl.attributeDetails.value' required>" + 
                            "<span ng-if='generateFormFieldCtrl.attributeDetails.type === \"Boolean\"'>" + 
                                "<form>" + 
                                    "<input type='radio' id='yes_{{$id}}' ng-model='generateFormFieldCtrl.attributeDetails.value' name='{{generateFormFieldCtrl.fieldName}}' value='true'>" + 
                                    "<label for='yes_{{$id}}'' style='margin-left: 10px;'>Yes</label>" +
                                    "<input type='radio' id='no_{{$id}}' style='margin-left: 40px;' ng-model='generateFormFieldCtrl.attributeDetails.value' name='{{generateFormFieldCtrl.fieldName}}' value='false'>" +
                                    "<label for='no_{{$id}}' style='margin-left: 10px;'>No</label>" +
                                "</form>" +
                            "</span>" +
                            "<span ng-if='generateFormFieldCtrl.attributeDetails.type === \"Brick[]\"'>" +
                                "<select class='form-control' name='multipleSelect' id='multipleSelect' ng-model='generateFormFieldCtrl.attributeDetails.value' multiple required>" +
                                    "<option ng-repeat='option in generateFormFieldCtrl.listOptions' value='{{option.value}}'>" +
                                        "{{option.name}}" + 
                                    "</option>" +
                                "</select>" +
                            "</span>" +
                        "</div>"
    });

}());
