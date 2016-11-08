(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("navController", navController);

    /*@ngInject*/
    function navController($scope, $rootScope, menuService) {

        var vm = this;
        vm.menus = menuService.getMenus();

<<<<<<< HEAD
        $rootScope.$on("$stateChangeSuccess", function(event, current, prev) {
            menuService.setActive(current.name);
        });

=======
>>>>>>> header and navigation implementation
    }

})();