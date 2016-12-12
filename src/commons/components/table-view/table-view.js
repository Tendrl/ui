(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("tableView", tableView);

    function tableView() {

        return  {
                restrict: "E",

                scope: {
                    heading: "@",
                    colums: "=",
                    tableData: "=",
                    selectedData: "="
                },

                replace: false,

                controller: function($scope) {

                    $scope.selectData = function(node){
                        if($scope.selectedData.indexOf(node.node_id) !== -1) {
                            remove($scope.selectedData, node.node_id);
                        } else {
                            $scope.selectedData.push(node.node_id);
                        }
                    }

                    function remove(arr, item) {
                        for(var i = arr.length; i--;) {
                          if(arr[i] === item) {
                              arr.splice(i, 1);
                          }
                        }
                    }

                },
                templateUrl: "/commons/components/table-view/table-view.html"
        }
    }

}());
