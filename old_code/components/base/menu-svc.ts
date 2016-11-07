/// <reference path="../../../typings/tsd.d.ts" />

export class MenuService {
    private menus: Array<any>;
    constructor() {
        this.menus = [{
            label: 'Dashboard',
            id: 'dashboard',
            href: '/dashboard',
            icon: 'fa fa-dashboard',
            active: true
        }, {
            label: 'Clusters',
            id: 'clusters',
            href: '/clusters',
            icon: 'pficon pficon-cluster',
            active: false
        }, {
            label: 'Hosts',
            id: 'hosts',
            href: '/hosts',
            icon: 'pficon pficon-container-node',
            active: false
        },{
            label: 'Storage',
            id: 'storage',
            href: '/storage',
            icon: 'fa fa-database',
            hasSubMenus: true,
            subMenus: [
                {
                    title: 'Pools',
                    id: 'pools',
                    href: '#/storage',
                    active: true
                },
                {
                    title: 'RBDs',
                    id: 'rbds',
                    href: '#/rbds'
                }
            ],
            active: false
        },{
            label: 'Admin',
            id: 'admin',
            href: '/events',
            icon: 'fa fa-cog',
            hasSubMenus: true,
            subMenus: [
                {
                    title: 'Events',
                    id: 'events',
                    href: '#/events',
                    active: true
                },
                {
                    title: 'Tasks',
                    id: 'tasks',
                    href: '#/tasks'
                },
                {
                    title: 'Users',
                    id: 'users',
                    href: '#/admin'
                },
                {
                    title: 'LDAP/AD Settings',
                    id: 'ldap',
                    href: '#/admin/ldap'
                },
                {
                    title: 'Mail Settings',
                    id: 'mail',
                    href: '#/admin/email'
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
