(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("tendrlNav", {

            restrict: "E",
            templateUrl: "/modules/base/navigation/navigation.html",
            bindings: {},
            controller: navController,
            controllerAs: "navCtrl"
        });

    angular
        .module("TendrlModule")
        .component("subMenu", {

            restrict: "E",
            templateUrl: "/modules/base/navigation/sub-menu.html",
            bindings: {
                menu: "="
            },
            controller: subMenuController,
            controllerAs: "subMenuCtrl"
        });

    /*@ngInject*/
    function navController($scope, $rootScope, $stateParams, menuService) {

        var vm = this;
        vm.clusterId = $stateParams.clusterId;
        vm.menus = menuService.getMenus(vm.clusterId);

        /* fixed for navigation slide issue*/
        var deregisterfn = $rootScope.$on("$viewContentLoaded", function() {
            var navigation = $();
            setTimeout(function() {
               navigation.setupVerticalNavigation(true);
            }, 0);
            deregisterfn();
        });
    }

    function subMenuController($scope, $rootScope, menuService) {

        var vm = this;
        vm.toggleSubmenu = function(){
            vm.isSubmenuExpand = !vm.isSubmenuExpand;
        }
    }

})();
