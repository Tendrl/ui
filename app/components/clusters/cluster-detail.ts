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
    private objects: any;
    private monitors: any;
    private tabList: Array<any>;
    private tabIndex: any;
    private discoveredHostsLength: any;
    private clusterUtilization: any;
    private openStackPools: any;
    private mostUsedPools: any;
    private utilizationByType: any;
    private utilizationByProfile: any;

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

        this.clusterUtilization = { data: {}, config: {} };
        this.openStackPools = [];
        this.mostUsedPools = [];
        this.clusterList = [];
        this.tabList = [
            { tabName: "Overview" },{ tabName: "CRUSH map" },{ tabName: "Pools" },{ tabName: "RBDs" },
            { tabName: "OSDs" },{ tabName: "Storage Profiles" },{ tabName: "Configuration" }
        ];
        this.tabIndex = 0;
        this.clusterHelpers = new ClusterHelper(null, null, null, null);
        this.utilizationByType = {};
        this.utilizationByProfile = {};
        this.id = this.routeParamsSvc['id'];
        this.cluster = {};
        this.capacity = {};
        this.hosts = { total: 0, warning: 0, critical: 0 };
        this.pgs = { total: 0, warning: 0, critical: 0 };
        this.osds = { total: 0, warning: 0, critical: 0 };
        this.objects = { total: 0, warning: 0, critical: 0 };
        this.pools = { total: 0, warning: 0, critical: 0 };
        this.monitors = { total: 0, warning: 0, critical: 0 };

        this.getUtilizationByType();
        this.getOpenStackPools();
        this.getMostUsedPools();
        this.serverService.getDiscoveredHosts().then((freeHosts) => {
            this.discoveredHostsLength = freeHosts.length;
        });
        this.clusterService.getList().then((clusters: Array<any>) => {
           this.clusterList = clusters;
        });
        this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
           this.osds.total = slus.length;
        });
        this.clusterService.getClusterObjects(this.id).then((clusterObjects: Array<any>) => {
           this.objects.total = clusterObjects.length;
        });
        this.storageService.getListByCluster(this.id).then((storages: Array<any>) => {
           this.pools.total = storages.length;
        });
        this.clusterService.get(this.id).then((cluster) => this.loadCluster(cluster));
        this.clusterService.getClusterUtilization(this.id).then((utilizations) => this.getClusterUtilization(utilizations));
        this.clusterService.getStorageProfileUtilization(this.id).then((utilizations) => this.getUtilizationByProfile(utilizations));
        this.serverService.getListByCluster(this.id).then((hosts) => this.getHostStatus(hosts));
        this.serverService.getList().then((nodes) => this.getMonitors(nodes));

    }

    public getUtilizationByType() {
        this.utilizationByType.title = 'Utilization by storage type';
        this.utilizationByType.data = {
          'total': '100',
          'subdata' : [ { "used" : 45 , "color" : "#00558a" , "subtitle" : "Object" },
                        { "used" : 15 , "color" : "#0071a6" , "subtitle" : "Block" },
                        { "used" :  5 , "color" : "#00a8e1" , "subtitle" : "OpenStack" }]
        };
        this.utilizationByType.layout = {
          'type': 'multidata'
        };
    }

    public getUtilizationByProfile(utilizations: Array<any>) {
        this.utilizationByProfile.title = 'Utilization by storage profile';
        this.utilizationByProfile.layout = {
          'type': 'multidata'
        };
        var subdata = [];
        _.each(utilizations, (utilization: any) => {
            var label = utilization.target.split('.');
            var usedData  = utilization.datapoints[0][0];
            if( label[3] === 'usage_percent' ) {
                if ( label[2] === 'storage_profile_utilization_general') {
                    subdata.push({ "used" : usedData , "color" : "#00558a" , "subtitle" : "General" });
                }
                else if (label[2] === 'storage_profile_utilization_sas') {
                    subdata.push({ "used" : usedData , "color" : "#0071a6" , "subtitle" : "SAS" });
                }else if (label[2] === 'storage_profile_utilization_ssd') {
                    subdata.push({ "used" : usedData , "color" : "#00a8e1" , "subtitle" : "SSD" });
                }
            }
        });
        this.utilizationByProfile.data = {
          'total': '100',
          'subdata' : subdata
        };
    }

    public getOpenStackPools() {
        this.openStackPools.push({"title":"Cinder","units":"GB","data":{"used":"25","total":"100"}});
        this.openStackPools.push({"title":"Cinder-Backup","units":"GB","data":{"used":"75","total":"100"}});
        this.openStackPools.push({"title":"Glance","units":"GB","data":{"used":"86","total":"100"}});
        this.openStackPools.push({"title":"Nova","units":"GB","data":{"used":"30","total":"100"}});
    }

    public getMostUsedPools() {
        this.mostUsedPools.push({"title":"Pool1","units":"GB","data":{"used":"85","total":"100"}});
        this.mostUsedPools.push({"title":"Pool2","units":"GB","data":{"used":"75","total":"100"}});
        this.mostUsedPools.push({"title":"Pool3","units":"GB","data":{"used":"95","total":"100"}});
        this.mostUsedPools.push({"title":"Pool4","units":"GB","data":{"used":"30","total":"100"}});
    }

    public loadCluster(cluster: any) {
        this.cluster.name = cluster.name;
        this.cluster.type = this.clusterHelpers.getClusterType(cluster.cluster_type);
        this.cluster.status = cluster.status;
        this.cluster.enabled = cluster.enabled;
    }

    public getClusterUtilization(utilizations: Array<any>) {
        _.each(utilizations, (utilization: any) => {
            var label = utilization.target.split('.')[3];
            var data  = utilization.datapoints[0][0];
            var dataFormated = numeral(data).format('0 b');
            if ( label === 'total_bytes') {
                this.capacity.total = dataFormated;
                this.clusterUtilization.data.total = data;
            }
            else if (label === 'total_used_bytes') {
                this.capacity.used = dataFormated;
                this.clusterUtilization.data.used = data;
            }
        });
        this.clusterUtilization.config.chartId = "utilizationChart";
        this.clusterUtilization.config.units = "GB";
        this.clusterUtilization.config.thresholds = {'warning':'60','error':'90'};
        this.clusterUtilization.config.legend = {"show":false};
        this.clusterUtilization.config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       numeral(d[0].value).format('0 b') + ' ' + d[0].name +
                     '</span>';
        };
        this.clusterUtilization.config.centerLabelFn = () => {
              return Math.round(100 * (this.clusterUtilization.data.used / this.clusterUtilization.data.total)) + "% Used";
        };
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
                this.monitors.total++;
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
