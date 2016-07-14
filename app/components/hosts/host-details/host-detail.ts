// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {Node} from '../../rest/server';

export class HostDetailController {
    private hostList: Array<Node>;
    private host: Node;
    private id: string;
    private tabList: any;
    private activeTab: number;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$routeParams',
        'ServerService'
    ];

    constructor(private routeParamsSvc: ng.route.IRouteParamsService,
        private serverService: ServerService) {
            this.hostList = [];
            this.tabList = {
                Overview: 1,
                Configuration: 2
            }
            this.activeTab = this.tabList.Overview;
            this.id = this.routeParamsSvc['id'];
            this.serverService.getList().then((hosts: Array<any>) => {
                this.hostList = _.filter(hosts, (host) => {
                    return host.state === 2; /* Only Active host will list down in drop-down list*/
                });
                this.host = _.find(hosts, (host) => {
                    return host.nodeid === this.id;
                });
                if(this.host.roles.indexOf('OSD') > -1) {
                    this.tabList.OSDs = 3
                }
                this.host.utilizations.networkusage.updatedat = new Date(this.host.utilizations.networkusage.updatedat.replace(/-/g,"/").split('.')[0]);
            });
    }

    public setTab(newTab: number) {
        this.activeTab = newTab;
    }

    public isSet(tabNum: number) {
        return this.activeTab === tabNum;
    }

}
