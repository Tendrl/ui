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
    function navController($scope, $rootScope, $state, $timeout, menuService) {

        var vm = this;
        vm.isNavigationShow = $rootScope.isNavigationShow;
        updateMenus($rootScope.selectedClusterOption);
        $rootScope.$watch("selectedClusterOption", function(newValue, oldValue) {
            updateMenus(newValue);
        });

        $rootScope.$watch("isNavigationShow", function(newValue, oldValue) {
            vm.isNavigationShow = $rootScope.isNavigationShow;
        });

        function updateMenus(clusterId) {
            vm.menus = menuService.getMenus(clusterId);
            menuService.setActive($state.current.name);
            $rootScope.isNavigationShow = clusterId !== "allClusters";
        }

        /* fixed for navigation slide issue*/
        var deregisterfn = $rootScope.$on("$viewContentLoaded", function() {
            var _$= $();
            $timeout(function() {
                if ($rootScope.isNavigationShow) {
                    localStorage.setItem("patternfly-navigation-primary", "expanded");
                } else {
                    localStorage.setItem("patternfly-navigation-primary", "collapsed");
                }
                _$.setupVerticalNavigation(true);
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
