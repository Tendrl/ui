/// <reference path="../../../typings/tsd.d.ts" />

import {Cluster} from '../rest/resources';
import {ServerService} from '../rest/server';

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
        return this.rest.one('clusters', id).post('enable');
    }

    // **disable**
    // **@param** id - id of the cluster
    // **@returns** a promise with the request id for the operation.
    public disable(id) {
        return this.rest.one('clusters', id).post('disable');
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
}
