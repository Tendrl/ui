
import {MockDataProvider} from '../clusters/mock-data-provider-helpers';
import {ClusterHelper} from '../clusters/cluster-helpers';
import {ClusterService} from '../rest/clusters';
import {ServerService} from '../rest/server';

export class HostController {
    private self = this;
    public clusterList: Array<any>;
    private clusterHelper;
    private mockDataProviderHelper;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$location',
        'ClusterService',
        'ServerService',
    ];
    private timer = this.intervalSvc(this.reloadData, 15000);

    constructor(
        private scopeSvc: ng.IScope,
        private intervalSvc: ng.IIntervalService,
        private locationSvc: ng.ILocationService,
        private clusterSvc: ClusterService,
        private serverService: ServerService) {
        clusterSvc.getList().then(this.updateData);

    }
    updateData = (clusters) => {
        this.clusterList = clusters;
        if (this.clusterList.length === 0) {
            this.locationSvc.path('/first');
        }
    }

    reloadData() {
        this.serverService.getList().then(this.updateHost);
    }

    updateHost = (hosts) => {
        _.each(hosts, function(host: any) {
            var mockHost = this.MockDataProvider.getMockHost(host.node_name);
            host.node_name = host.node_name.split(".")[0];
            host.alerts = mockHost.alerts;
            host.cpu_average = Math.random() * 100;
            host.memory_average = Math.random() * 100;
            host.cluster_type = 2;
            host.version = '';
            if (host.cluster != null) {
                this.clusterSvc.get(host.cluster).then(function(cluster) {
                    host.cluster_type = cluster.cluster_type;
                    host.version = host.cluster_type === 1 ? 'V3.7.1' : 'V9.0.1';
                });
            }
        });
    }

    public getClusterTypeTitle(type) {
        return ClusterHelper.getClusterType(type).type;
    }

    public getNodeTypeTitle(node_type) {
        if (node_type === 1)
            return 'Monitor Host';
        else if (node_type === 2)
            return 'OSD Host';
        else if (node_type === 3)
            return 'OSD and Monitor';
        else
            return 'Gluster Host';
    }

    public getHostDonutColor(donut_value) {
        if (donut_value >= 90) return '#E35C5C';
        if (donut_value >= 80) return '#FF8C1B';
        else return '#4AD170';
    }

    public remove(node_id) {
        this.serverService.remove(node_id).then(function(result) {
            this.reloadData();
            console.log(result);
        });
    }
}
 