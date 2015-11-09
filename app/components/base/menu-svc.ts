/// <reference path="../../../typings/tsd.d.ts" />

export class MenuService {
    private menus: Array<any>;
    constructor() {
        this.menus = [{
            label: 'Dashboard',
            id: 'dashboard',
            href: '/dashboard',
            icon: 'fa-tachometer',
            active: true
        }, {
            label: 'Clusters',
            id: 'clusters',
            href: '/clusters',
            icon: 'fa-cubes',
            active: false
        }, {
            label: 'Hosts',
            id: 'hosts',
            href: '/hosts',
            icon: 'fa-desktop',
            active: false
        },{
            label: 'Storages',
            id: 'storages',
            href: '/storages',
            icon: 'fa-hdd-o',
            active: false
        },{
            label: 'Admin',
            id: 'admin',
            href: '/admin',
            icon: 'fa-users',
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
