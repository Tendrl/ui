(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("notification", notification);

    function notification() {

        return  {
                restrict: "E",

                scope: {
                    notificationType: "@",
                    notificationMessage: "@",
                    notificationCloseCallBack: '&'
                },

                replace: false,

                controller: function($scope) {

                    $scope.notificationCssStyle = {
                        "info" : "pficon-info",
                        "success" : "pficon-ok",
                        "warning" : "pficon-warning-triangle-o",
                        "danger" : "pficon-error-circle-o"
                    }

                    $scope.closeNotification = function() {
                        $scope.notificationCloseCallBack();
                    }

                },
                template:   "<div ng-if='notificationMessage.length' class='toast-pf alert alert-{{notificationType}} alert-dismissable'>" +
                                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>" +
                                    "<span class='pficon pficon-close' ng-click='closeNotification()'></span>" +
                                "</button>" +
                                "<span class='pficon {{notificationCssStyle[notificationType]}}'></span>" + 
                                "{{notificationMessage}}" +
                            "</div>"
        }
    }

}());
