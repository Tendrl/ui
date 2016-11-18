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

                    if($scope.attributeDetails.type === "List") {
                        
                        /* TODO :- ask api team to send URL */
                        var listType = $scope.attributeDetails.name.slice(0, -2),
                            i,
                            j,
                            len,
                            listLen,
                            keys;
                        
                        utils.getObjectList(listType).then(function(listOptions) {
                            
                            $scope.listOptions = listOptions;
                            listLen = $scope.listOptions.length;

                            keys = Object.keys($scope.listOptions[0]);
                            len = keys.length;

                            /* TODO :- This should be handle by API itself */
                            for( j = 0; j < listLen; j++) {

                                for(i = 0; i < len; i++) {
                                    
                                    if((keys[i].slice(keys[i].length-2, keys[i].length).toLowerCase()) === "id") {
                                        $scope.listOptions[j].mappedId = $scope.listOptions[j][keys[i]];
                                        break;
                                    }
                                }
                            }

                        });
                     }

                },
                template:   "<div class='col-sm-6 tendrl-generate-form-field-container'>" +
                                "<input type='text' placeholder='{{attributeDetails.help}}' class='form-control' name='{{fieldName}}' ng-if='attributeDetails.type === \"String\"' ng-model='attributeDetails.value' ng-required='attributeDetails.required'>" +
                                "<input type='number' placeholder='{{attributeDetails.help}}' class='form-control' name='{{fieldName}}' ng-if='attributeDetails.type === \"Integer\"' ng-model='attributeDetails.value' ng-required='attributeDetails.required'>" + 
                                "<span ng-if='attributeDetails.type === \"Boolean\"'>" + 
                                    "<form>" + 
                                        "<input type='radio' id='yes_{{$id}}' ng-model='attributeDetails.value' name='{{fieldName}}' value='true'>" + 
                                        "<label for='yes_{{$id}}'' class='radio-label'>Yes</label>" +
                                        "<input type='radio' id='no_{{$id}}' class='radio-button' ng-model='attributeDetails.value' name='{{fieldName}}' value='false'>" +
                                        "<label for='no_{{$id}}' class='radio-label'>No</label>" +
                                    "</form>" +
                                "</span>" +
                                "<span ng-if='attributeDetails.type === \"List\"'>" +
                                    "<select class='form-control' name='multipleSelect' id='multipleSelect' ng-model='attributeDetails.value' multiple ng-required='attributeDetails.required'>" +
                                        "<option ng-repeat='option in listOptions' value='{{option.mappedId}}'>" +
                                            "{{option.fqdn}}" + 
                                        "</option>" +
                                    "</select>" +
                                "</span>" +
                            "</div>"
        }
    }

}());
