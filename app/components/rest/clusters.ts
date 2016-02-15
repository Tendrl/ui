/// <reference path="../../../typings/tsd.d.ts" />

import {ServerService} from '../rest/server';

export interface Cluster {
    clusterid: string;
    name: string;
    compat_version: string;
    type: string;
    workload: string;
    state: ClusterState;
    status: ClusterStatus;
    tags: Array<string>;
    options: {};
    openstack_services: Array<string>;
    networks: {};
}

export enum ClusterState {
    CREATING,   //0
    FAILED,     //1
    ACTIVE,     //2
    UNMANAGED   //3
}

export enum ClusterStatus {
    OK,         //0
    WARNING,    //1
    ERROR,      //2
    UNKNOWN     //3
}

export interface ClusterCapacity {
    target: string,
    datapoints: Array<Array<string>>
}

export class ClusterService {
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular', '$q', 'ServerService'];
    constructor(rest: restangular.ICollection,
        private $q: ng.IQService,
        private serverSvc: ServerService) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **getList**
    // **@returns** a promise with a list of all the clusters.
    public getList() {
        return this.rest.all('clusters').getList<Cluster>();
    }

    // **getAlerts**
    // **@returns** a promise with all cluster's alerts.
    getAlerts(cluster_id) {
        return this.rest.all('events?cluster_id='+cluster_id).getList().then(function(alerts) {
            return alerts;
        });
    }

    // **getCapacity**
    // **@returns** a promise with the cluster capacity for the specific
    // cluster based on it's id.
    getCapacity(id) {
        return this.serverSvc.getListByCluster(id).then((nodes) => {
            var capacity = 0;
            _.each(nodes, (node) => {
                var size = _.reduce(node.storage_disks, function(size, device: any) {
                    return device.Type === 'disk' ? device.Size + size : size;
                }, 0);
                capacity = capacity + size;
            });
            return capacity;
        });
    }

    // **enable**
    // **@param** id - id of the cluster
    // **@returns** a promise with the request id for the operation.
    public enable(id) {
        return this.rest.one('clusters', id).post('manage');
    }

    // **disable**
    // **@param** id - id of the cluster
    // **@returns** a promise with the request id for the operation.
    public disable(id) {
        return this.rest.one('clusters', id).post('unmanage');
    }

    // **remove**
    // **@param** id - id of cluster you wish to remove.
    // This is a **destructive** operation and will remove
    // any data on this cluster.
    // **@returns** a promise with the request id for the operation.
    public remove(id) {
        return this.rest.one('clusters', id).remove();
    }

    // **get**
    // **@returns** a promise with the cluster metadata for the specific
    // cluster based on it's id.
    get(id) {
        return this.rest.one('clusters', id).get<Cluster>();
    }

    // **getByName**
    // **@returns** a promise with the cluster metadata for the specific
    // cluster based on it's name.
    getByName(name: string) {
        return this.getList().then<Cluster>(function(clusters: Array<Cluster>) {
            return _.find(clusters, function(cluster: Cluster) {
                return cluster.name === name;
            });
        });
    }

    // **create**
    // **@param** cluster - Information about the cluster and list of hosts.
    // **@returns** a promise which returns a request id to track the task.
    create(cluster) {
        return this.restFull.all('clusters').post(cluster);
    }

    // **expand**
    // **@param** cluster - Information about the cluster and list of hosts.
    // **@returns** a promise which returns a request id to track the task.
    expand(clusterId, cluster) {
        return this.restFull.one('clusters', clusterId).post('expand', cluster);
    }

    // **getSlus**
    // **@returns** a promise with all slus of the cluster.
    getSlus(clusterId) {
        return this.rest.one('clusters', clusterId).all('slus').getList().then(function(slus) {
            return slus;
        });
    }

    // **getClusterUtilization**
    // **@returns** a promise with cluster's utilization.
    getClusterUtilization(cluster_id) {
        return this.rest.all('monitoring/cluster/'+cluster_id+'/utilization?resource=cluster_utilization*.*&duration=latest').getList<ClusterCapacity>().then(function(clustercapacities: Array<ClusterCapacity>) {
            return clustercapacities;
        });
    }

    // **getStorageProfileUtilization**
    // **@returns** a promise with Storage Profile's utilization.
    getStorageProfileUtilization(cluster_id) {
        return this.rest.all('monitoring/cluster/'+cluster_id+'/utilization?resource=storage_profile_utilization*.*&duration=latest').getList().then(function(storage_profile_utilization) {
            return storage_profile_utilization;
        });
    }

    // **getClusterObjects**
    // **@returns** a promise with cluster's objects.
    getClusterObjects(cluster_id) {
        return this.rest.all('monitoring/cluster/'+cluster_id+'/utilization?resource=no_of_object&duration=latest').getList().then(function(cluster_objects) {
            return cluster_objects;
        });
    }

}
