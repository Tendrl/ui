/// <reference path="../../../typings/tsd.d.ts" />

export class MenuController {
    static $inject: Array<string> = ['$scope', '$location', '$rootScope', '$routeParams', 'MenuService'];
    constructor(
        $scope: any,
        $location: ng.ILocationService,
        $rootScope: ng.IRootScopeService,
        $routeParams: ng.route.IRouteParamsService,
        MenuService: any) {

        $scope.menus = MenuService.getMenus();

        $scope.navigate = function(menu, parentMenu) {
            $location.path(menu.href)
        }
        var deregisterfn = $rootScope.$on("$viewContentLoaded", function() {
            var temp: any = $();
            setTimeout(function() {
               temp.setupVerticalNavigation(true);
            }, 0);
            deregisterfn();
        });
        $rootScope.$on("$routeChangeSuccess", (event, current, prev) => {
            MenuService.setActive(current.name)
        });
    }
}
