(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("generateFormField", generateFormField);

    /*@ngInject*/
    function generateFormField() {

        return {
            restrict: "E",

            scope: {
                attributeDetails: "=",
                fieldName: "="
            },

            replace: false,

            controller: function($scope, actionStore) {
                var vm = this;
                if($scope.attributeDetails.type === "List") {
                    actionStore.getListOptions().then(function (listOptions) {
                        $scope.listOptions = listOptions.data;
                    });
                }
            },

            //templateUrl: "../tendrl-frontend/dist/Tendrl/commons/directives/generate-form-field/generate-form-field-template.html",
            template: "<div class='col-sm-9 generate-form-field-container'>" +
                        
                        "<input type='text' class='form-control' name='{{fieldName}}' ng-if='attributeDetails.type === \"String\"' ng-model='attributeDetails.value' required>" +
                        "<input type='number' class='form-control' name='{{fieldName}}'' ng-if='attributeDetails.type === \"Integer\"' ng-model='attributeDetails.value' required>" +
                        "<span ng-if='attributeDetails.type === \"Boolean\"'>" +
                            "<label>{{fieldName}}</label>" +
                            "<input type='radio' ng-model='attributeDetails.value' name='{{fieldName}}' value='yes' required><label>Yes</label>" +
                            "<input type='radio' ng-model='attributeDetails.value' name='{{fieldName}}' value='no'><label>No</label>" +
                        "</span>" +

                        "<span ng-if='attributeDetails.type === \"List\"'>" +
                            "<label>{{fieldName}}</label>" +
                            "<select class='form-control' name='multipleSelect' id='multipleSelect' ng-model='fieldName' multiple required>" +
                                "<option ng-repeat='option in listOptions' value='{{option.value}}'>" +
                                    "{{option.name}}" +
                                "</option>" +
                            "</select>" +
                        "</span>" +
                    "</div>"

        };
    }

}());
