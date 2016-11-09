(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("generateFormField", generateFormField);

    function generateFormField() {
        return {
                restrict: "E",

                scope: {
                    attributeDetails: "=",
                    fieldName: "@"
                },

                replace: false,

                controller: function($scope, utils) {

                    if($scope.attributeDetails.type === "Brick[]") {

                        utils.getListOptions().then(function(listOptions) {
                            $scope.listOptions = listOptions.data;
                        });
                    }

                },
                template:   "<div class='col-sm-6 tendrl-generate-form-field-container'>" +
                                "<input type='text' class='form-control' name='{{fieldName}}' ng-if='attributeDetails.type === \"String\"' ng-model='generateFormFieldCtrl.attributeDetails.value' required>" +
                                "<input type='number' class='form-control' name='{{fieldName}}' ng-if='attributeDetails.type === \"Integer\"' ng-model='generateFormFieldCtrl.attributeDetails.value' required>" + 
                                "<span ng-if='attributeDetails.type === \"Boolean\"'>" + 
                                    "<form>" + 
                                        "<input type='radio' id='yes_{{$id}}' ng-model='attributeDetails.value' name='{{fieldName}}' value='true'>" + 
                                        "<label for='yes_{{$id}}'' class='radio-label'>Yes</label>" +
                                        "<input type='radio' id='no_{{$id}}' class='radio-button' ng-model='attributeDetails.value' name='{{generateFormFieldCtrl.fieldName}}' value='false'>" +
                                        "<label for='no_{{$id}}' class='radio-label'>No</label>" +
                                    "</form>" +
                                "</span>" +
                                "<span ng-if='attributeDetails.type === \"Brick[]\"'>" +
                                    "<select class='form-control' name='multipleSelect' id='multipleSelect' ng-model='attributeDetails.value' multiple required>" +
                                        "<option ng-repeat='option in listOptions' value='{{option.value}}'>" +
                                            "{{option.name}}" + 
                                        "</option>" +
                                    "</select>" +
                                "</span>" +
                            "</div>"
        }
    }

}());
