/// <reference path="../../../typings/tsd.d.ts" />

export class MenuService {
    private menus: Array<any>;
    constructor() {
        this.menus = [{
            label: 'Dashboard',
            id: 'dashboard',
            href: '/dashboard',
            hasSubMenus: false,
            icon: 'fa-tachometer',
            active: true
        }, {
            label: 'Clusters',
            id: 'clusters',
            href: '/clusters',
            hasSubMenus: false,
            icon: 'fa-cubes',
            active: false
        }, {
            label: 'Hosts',
            id: 'hosts',
            href: '/hosts',
            hasSubMenus: false,
            icon: 'fa-desktop',
            active: false
        }, {
            label: 'Storage',
            id: 'storage',
            icon: 'fa-hdd-o',
            hasSubMenus: true,
            subMenus: [
                {
                    title: 'Volumes',
                    id: 'volumes',
                    href: '/volumes'
                },
                {
                    title: 'Pools',
                    id: 'pools',
                    href: '/pools'
                }
            ],
            active: false
        }];
    }

    public setActive(menuId: string) {
        this.menus = _.map(this.menus, (menu) => {
            menu.active = menu.id === menuId;
            return menu;
        });
    }

    public getMenus() {
        return this.menus;
    }
}
