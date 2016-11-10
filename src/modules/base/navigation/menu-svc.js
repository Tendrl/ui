(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("menuService", menuService);

    /*@ngInject*/
    function menuService() {

        /* Cache the reference to this pointer */
        var vm = this;

        vm.menus = [{
            label: 'Dashboard',
            id: 'dashboard',
            href: 'dashboard',
            icon: 'fa fa-dashboard',
            active: true
        }, {
            label: 'Volumes',
            id: 'volume',
            href: 'volume',
            icon: 'fa fa-database',
            active: false
        }];

        vm.setActive = function(menuId) {
            vm.menus.map(function(menu){
                menu.active = menu.id === menuId;
                return menu;
            });
        }
        
        vm.getMenus = function() {
            return vm.menus;
        };
    }

})();