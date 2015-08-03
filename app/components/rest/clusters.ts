/// <reference path="../../../typings/tsd.d.ts" />

import {ServerService} from '../rest/server'

export class ClusterService {
    config: Array<any>;
    private clusterId: any;
    private clusterModel: any;
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular', '$location', '$q', 'ServerService'];
    constructor(rest: restangular.ICollection,
        private $location: ng.ILocationService,
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
    public getList(): any {
        return this.rest.all('clusters').getList().then(function(clusters) {
            clusters = _.sortBy(clusters, function(cluster) {
                return cluster.cluster_name;
            });
            return clusters;
        });
    }
    
    // **getCapacity**
    // **@returns** a promise with the cluster capacity for the specific
    // cluster based on it's id.

    getCapacity(id) {
        return this.serverSvc.getListByCluster(id).then((servers) =>{
            var requests = [];
            _.each(servers, function(server) {
                requests.push(this.serverSvc.getDiskStorageDevices(server.node_id));
            });
            return this.$q.all(requests).then(function(devicesList) {
                var capacity = 0;
                _.each(devicesList, function(devices: Array<any>) {
                    var size = _.reduce(devices, function(size, device) {
                        return device.size + size;
                    }, 0);
                    capacity = capacity + size;
                });
                return capacity;
            });
        });
    }
    
    // **remove**
    // **@param** id - id of cluster you wish to remove.
    // This is a **destructive** operation and will remove
    // any data on this cluster.
    // **@returns** a promise with the request id for the operation.
    remove(id) {
        return this.rest.one('clusters', id).remove();
    }

    // **initialize**
    // This must be run before any other service to
    // initialize the cluster model and fsid values.
    // **@returns** a promise so you can wait for it to be complete.
    initialize() {
        var self = this;
        return this.getList().then(function(clusters: any) {
            if (clusters.length) {
                var cluster: any = _.first(clusters);
                self.clusterId = cluster.id;
                self.clusterModel = cluster;
                return;
            }
            self.clusterId = null;
            self.clusterModel = null;
            this.$location.path('/first');
        });
    }

    // **get**
    // **@returns** a promise with the cluster metadata for the specific
    // cluster based on it's id.
    get(id) {
        return this.rest.one('clusters', id).get().then(function(cluster) {
            return cluster;
        });
    }

    // **getByName**
    // **@returns** a promise with the cluster metadata for the specific
    // cluster based on it's id.
    getByName(name) {
        return this.getList().then(function(clusters) {
            return _.find(clusters, function(cluster: any) {
                return cluster.cluster_name === name;
            });
        });
    }

    // **cluster**
    // A base function that defines the root of all cluster specific
    // API requests.  It's designed to be called by other services.
    // ####e.g.
    // ```
    //     return restangular.cluster().all('servers');
    // ```
    //
    // This is how we can re-use this service without other
    // services having to be aware of the cluster FSID.
    //
    cluster(id) {
        if (id === undefined) {
            id = this.clusterId;
        }
        return this.rest.one('cluster', id);
    }

    // **clusterFull**
    // A base function that defines the root of all cluster
    // specific API request.
    // It's designed to be called by other methods.
    // Responses are raw and contain extra fields such as
    // status code.
    clusterFull(id) {
        if (id === undefined) {
            id = this.clusterId;
        }
        return this.rest.one('cluster', id);
    }

    // **create**
    // **@param** cluster - Information about the cluster and list of hosts.
    // **@returns** a promise which returns a request id to track the task.
    create(cluster) {
        return this.restFull.all('clusters').post(cluster);
    }

    // **switchCluster**
    // This will be invoked when the user switches the cluster
    // using the cluster dropdown in the top of the page
    switchCluster(cluster) {
        this.clusterModel = cluster;
        this.clusterId = cluster.id;
    }

    // **base**
    // Return the raw restangular reference.
    base() {
        return this.rest;
    }
}
