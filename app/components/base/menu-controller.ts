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

            if (parentMenu) {
                MenuService.setActive(parentMenu.id);
            }
            else {
                MenuService.setActive(menu.id);
            }
        }
        $rootScope.$on("$routeChangeStart", (event, next, current) => {
            MenuService.setActive(next.menuId)
        });
    }
}
