(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("navController", navController);
    app.directive("toggleSubmenu", toggleSubmenu);

    /*@ngInject*/
    function toggleSubmenu() {

        return  {
                restrict: "EA",
                scope: true,
                controller: "navController",
                controllerAs: "navCtrl",
                templateUrl: "/modules/base/navigation/sub-menu.html"
            }
        }

    /*@ngInject*/
    function navController($scope, $rootScope, menuService) {

        var vm = this;
        vm.toggleSubmenu = function(){
            vm.isSubmenuExpand = !vm.isSubmenuExpand;
        }
        vm.menus = menuService.getMenus();

        /* fixed for navigation slide issue*/
        var deregisterfn = $rootScope.$on("$viewContentLoaded", function() {
            var navigation = $();
            setTimeout(function() {
               navigation.setupVerticalNavigation(true);
            }, 0);
            deregisterfn();
        });
    }

})();
