// <reference path="../typings/tsd.d.ts" />

import {ClusterHelper} from './cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';
import {StorageService} from '../rest/storage';
import {numeral} from '../base/libs';

export class ClusterDetailController {
    private clusterHelpers: ClusterHelper;
    private clusterList: Array<any>;
    private cluster: any;
    private capacity: any;
    private id: any;
    private hosts: any;
    private pools: any;
    private pgs: any;
    private osds: any;
    private monitorsLength: any;
    private tabList: Array<any>;
    private tabIndex: any;
    private discoveredHostsLength: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$scope',
        '$location',
        '$log',
        '$routeParams',
        'ClusterService',
        'ServerService',
        'StorageService'
    ];

    constructor(private qService: ng.IQService,
        private scopeService: ng.IScope,
        private locationService: ng.ILocationService,
        private logService: ng.ILogService,
        private routeParamsSvc: ng.route.IRouteParamsService,
        private clusterService: ClusterService,
        private serverService: ServerService,
        private storageService: StorageService) {

        this.clusterList = [];
        this.tabList = [
            { tabName: "Overview" },{ tabName: "CRUSH map" },{ tabName: "Pools" },{ tabName: "RBDs" },
            { tabName: "OSDs" },{ tabName: "Storage Profiles" },{ tabName: "Configuration" }
        ];
        this.tabIndex = 0;
        this.monitorsLength = 0;
        this.clusterHelpers = new ClusterHelper(null, null, null, null);

        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = { free: 25, used: 75, total: 100 };
        this.hosts = { total: 0, warning: 0, critical: 0 };
        this.pgs = { total: 1024, warning: 0, critical: 0 };
        this.osds = { total: 0, warning: 0, critical: 0 };
        this.pools = { total: 0, warning: 0, critical: 0 };

        this.serverService.getDiscoveredHosts().then((freeHosts) => {
            this.discoveredHostsLength = freeHosts.length;
        });
        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterList = clusters
        });
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
           this.osds.total = slus.length;
        });
        this.storageService.getListByCluster(this.id).then((storages: Array<any>) => {
           this.pools.total = storages.length;
        });
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.serverService.getListByCluster(this.id).then((hosts) => this.getHostStatus(hosts));
        this.serverService.getList().then((nodes) => this.getMonitors(nodes));
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
    }

    public getHostStatus(hosts: any) {
        this.hosts.total = hosts.length;
        var warning = 0, critical = 0;
        _.each(hosts, (host: any) => {
            if (host.node_status === 1) {
                critical++;
            }
        });
        this.hosts.critical = critical;
    }

    public getMonitors(nodes: any) {
        _.each(nodes, (node: any) => {
            if (node.clusterid === this.id && node.options1.mon === 'Y') {
                this.monitorsLength++;
            }
        });
    }

    public setTab(newTab: any) {
        this.tabIndex = newTab;
    }

    public isSet(tabNum: any) {
        return this.tabIndex === tabNum;
    }

}
