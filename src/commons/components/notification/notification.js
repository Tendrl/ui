(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("notification", {
            bindings: {
                notificationType: "@",
                notificationMessage: "@",
                notificationCloseCallBack: "&"
            },

            controller: function($scope, $rootScope) {
                var vm = this;

                vm.notificationCssStyle = {
                    "info": "pficon-info",
                    "success": "pficon-ok",
                    "warning": "pficon-warning-triangle-o",
                    "danger": "pficon-error-circle-o"
                }

                vm.closeNotification = function() {
                    vm.notificationCloseCallBack();
                };
            },
            controllerAs: "vm",
            template: "<div ng-show='vm.notificationMessage.length' class='toast-pf alert alert-{{vm.notificationType}} alert-dismissable'>" +
                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>" +
                "<span class='pficon pficon-close' ng-click='vm.closeNotification()'></span>" +
                "</button>" +
                "<span class='pficon {{vm.notificationCssStyle[vm.notificationType]}}'></span>" +
                "{{vm.notificationMessage}}" +
                "</div>"
        });

}());
