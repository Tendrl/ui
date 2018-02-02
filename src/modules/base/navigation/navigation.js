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

    function navController($scope, $rootScope, $state, $window, menuService) {

        var vm = this,
            navPlugin;

        updateMenus($rootScope.selectedClusterOption);

        $rootScope.$watch("selectedClusterOption", function(newValue, oldValue) {
            updateMenus(newValue);
            var forceHideNav = updateNav();
            if (!forceHideNav) {
                // Only force show the nav for context switches on desktop
                var width = angular.element($window).width();
                if (width > $.pfBreakpoints.tablet) {
                    showNav();
                }
            }
        });

        $rootScope.$on("toggleNav", function(newValue, oldValue) {
            var forceHideNav = updateNav();
            if (!forceHideNav) {
                showNav() || hideNav();
            }
        });

        function showNav() {
            if (!navPlugin.isVisible()) {
                navPlugin.showMenu();
                return true;
            }
            return false;
        }

        function hideNav() {
            if (navPlugin.isVisible()) {
                navPlugin.hideMenu();
                return true;
            }
            return false;
        }

        function updateNav() {
            if (!navPlugin) {
                return true;
            }
            var forceHideNav = $rootScope.forceHideNav();
            if (forceHideNav) {
                hideNav();
            }
            return forceHideNav;
        }

        function updateMenus(clusterId) {
            vm.menus = menuService.getMenus(clusterId);
            menuService.setActive($state.current.name);
        }

        //localStorage.setItem("patternfly-navigation-primary", "expanded");
        navPlugin = $().setupVerticalNavigation(true);
        updateNav();
        if (!navPlugin.showMenu || !navPlugin.hideMenu || !navPlugin.isVisible) {
            // Check for outdated PatternFly installs
            throw new Error('This PatternFly vertical navigation implementation requires a PatternFly version >= 3.26.1, re-reun npm install');
        }
    }

    function subMenuController($scope, $rootScope, menuService) {

        var vm = this;
        vm.toggleSubmenu = function() {
            vm.isSubmenuExpand = !vm.isSubmenuExpand;
        }
    }

})();
