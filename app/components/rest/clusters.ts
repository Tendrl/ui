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

export interface SLU { // StorageLogicalUnit
    sluid: string;
    almcount: number;
    almstatus: number;
    clusterid: string;
    name: string;
    nodeid: string;
    options: {};
    state: string;
    status: number;
    storagedeviceid: string;
    storagedevicesize: number;
    storageid: string;
    storageprofile: string;
    type: number;
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

    // **getClusterSummary**
    // **@returns** a promise with all details of cluster dashboard.
    getClusterSummary(cluster_id) {
        return this.rest.one('clusters/'+cluster_id+'/summary').get().then(function(summary) {
            return summary;
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
        return this.rest.one('clusters', clusterId).all('slus').getList<SLU>().then(function(slus) {
            return slus;
        });
    }

    // **slusAction**
    // **@returns** a promise with response of the slus's action.
    slusAction(clusterId, slusId, action) {
        return this.restFull.one('clusters', clusterId).one('slus', slusId).patch(action);
    }

    // **getClusterCpuUtilization**
    // **@returns** a promise with cluster's cpu utilization.
    getClusterCpuUtilization(cluster_name, time_slot) {
        return this.rest.all('monitoring/target=cactiStyle(collectd.'+cluster_name+'.cpu-user)&format=json&duration='+time_slot).getList().then(function(cpu_utilization) {
            return cpu_utilization;
        });
    }

    // **getClusterMemoryUtilization**
    // **@returns** a promise with cluster's memory utilization.
    getClusterMemoryUtilization(cluster_name, time_slot) {
        return this.rest.all('monitoring/target=cactiStyle(collectd.'+cluster_name+'.memory-usage_percent)&format=json&duration='+time_slot).getList().then(function(memory_utilization) {
            return memory_utilization;
        });
    }

    // **getIOPS**
    // **@returns** a promise with disks IOPS?.
    getIOPS(cluster_name, time_slot) {
        return this.rest.all('monitoring/target=cactiStyle(collectd.'+cluster_name+'.disk-read_write)&format=json&duration='+time_slot).getList().then(function(iops) {
            return iops;
        });
    }

    // **getIOPSBy**
    // **@returns** a promise with disks IOPS?.
    getIOPSById(cluster_id, time_slot) {
        return this.rest.all('monitoring/cluster/'+cluster_id+'/utilization?resource=disk-read_write&duration='+time_slot).getList().then(function(iops) {
            return iops;
        });
    }

    // **getThroughput**
    // **@returns** a promise with network throughput.
    getThroughput(cluster_name, time_slot) {
        return this.rest.all('monitoring/target=cactiStyle(collectd.'+cluster_name+'.interface-rx_tx)&format=json&duration='+time_slot).getList().then(function(throughput) {
            return throughput;
        });
    }

    // **getNetworkLatency**
    // **@returns** a promise with network latency.
    getNetworkLatency(cluster_name, time_slot) {
        return this.rest.all('monitoring/target=cactiStyle(collectd.'+cluster_name+'.network_latency)&format=json&duration='+time_slot).getList().then(function(network_latency) {
            return network_latency;
        });
    }

    // **getClusterConfig**
    // **@returns** a promise with cluster configuration details.
    getClusterConfig(clusterId) {
        return this.rest.one('clusters/'+clusterId+'/config').get().then(function(cluster_config) {
            return cluster_config;
        });
    }

    // **getImportClusterDeatils
    // **@returns** A promise with Ceph Cluster Information for importing
    getImportClusterDeatils(monNode: string) {
        return this.restFull.one('/nodesforimport?bootstrapnode=' + monNode + "&clustertype=ceph").get();
    }

    importCephCluster(bootStrapInfo: any) {
        return this.restFull.all('importcluster').post(bootStrapInfo);
    }

}
