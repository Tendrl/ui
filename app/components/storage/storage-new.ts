// <reference path="../../../typings/tsd.d.ts" />

import {ClusterService} from '../rest/clusters';
import {Cluster} from '../rest/resources';

export class StorageNewController {
    private clusters: Array<Cluster>;
    private cluster: Cluster;
    private type: String;

    static $inject: Array<string> = [
        '$location',
        'ClusterService'
    ];

    constructor(private $location: ng.ILocationService,
        private clusterSvc: ClusterService) {
        this.clusters = [];
        this.clusterSvc.getList().then((clusters) => {
            this.clusters = clusters;
            if (this.clusters.length > 0) {
                this.cluster = this.clusters[0];
            }
        });
        this.type = "object";
    }

    public next(): void {
        if (this.type === 'object') {
            this.addGenericStorage();
        }
        else if (this.type === 'block') {
        }
        else if (this.type === 'openstack') {
            this.addOpenStackStorage();
        }
    }

    public addGenericStorage(): void {
        this.$location.path('/storages/new/object/' + this.cluster.clusterid);
    }

    public addOpenStackStorage(): void {
        this.$location.path('/storages/new/openstack/' + this.cluster.clusterid);
    }
}
