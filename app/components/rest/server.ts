/// <reference path="../../../typings/tsd.d.ts" />

export interface Node {
    almcount: number;
    almstatus: AlarmStatus;
    cluster_ip4: string;
    clusterid: string;
    cpus: any[];
    enabled?: boolean;
    hostname: string;
    location: string;
    management_ip4: string;
    memory: {};
    network_info: {};
    nodeid: string;
    options: {};
    os: {};
    public_ip4: string;
    state: NodeState;
    status: NodeStatus;
    storage_disks: any[];
    tags: any[]
}

export interface UsageData {
    used: number;
    total: number;
}

export interface DashboardSummaryData {
     name: string;
     usage: UsageData;
     storageprofileusage: { general?: UsageData, sas?: UsageData, ssd?: UsageData};
     objectcnt: number;
     storagecount: { total: number, down: number };
     slucount: { total: number };
     nodescount: { error: number, total: number, unaccepted: number };
     clusterscount: { total: number, error: number };
     providermonitoringdetails: { ceph: { monitor: number } };
}

enum AlarmStatus {
    INDETERMINATE,  //0
    CRITICAL,       //1
    MAJOR,          //2
    MINOR,          //3
    WARNING,        //4
    CLEARED         //5
}

enum NodeState {
    UNACCEPTED,     //0
    INITIALIZING,   //1
    ACTIVE,         //2
    FAILED,         //3
    UNMANAGED       //4
}

export enum NodeStatus {
    OK,         //0
    WARN,       //1
    ERROR,      //2
    UNKNOWN     //3
}

export class ServerService {
    config: Array<any>;
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
            RestangularConfigurer.setFullResponse(true);
        });
    }


    // **getDashboardSummary**
    // **@returns** a promise with all details of main dashboard.
    getDashboardSummary() {
        return this.rest.one('system/summary').get().then(function(summary: DashboardSummaryData) {
            return summary;
        });
    }

    // **getList**
    // **@returns** a promise with all servers.
    getList() {
        return this.rest.all('nodes').getList<Node>().then(function(servers) {
            return _.sortBy(servers, "hostname");
        });
    }

    // **getListByCluster**
    // **@returns** a promise with all nodes part of the cluster.
    getListByCluster(clusterId) {
        return this.rest.one('clusters', clusterId).all('nodes').getList<Node>().then(function(nodes) {
            return _.sortBy(nodes, "hostname");
        });
    }

    // **getFreeHosts**
    // **@returns** a promise with all servers which are free.
    getFreeHosts() {
        return this.rest.all('nodes').getList<Node>({ state: 'free' }).then(function(servers) {
            return _.sortBy(_.filter(servers, server => server.state === NodeState.ACTIVE), "hostname");
        });
    }

    // **getDiscoveredHosts**
    // **@returns** a promise with all unmanaged nodes.
    getDiscoveredHosts() {
        return this.rest.all('unmanaged_nodes').getList().then(function(nodes: Array<any>) {
            var unmanagedNodes: Array<any> = [];
            _.each(nodes, (node) => {
                 unmanagedNodes.push({ hostname: node.hostname, saltfingerprint: node.saltfingerprint });
            });
            return _.sortBy(unmanagedNodes, "hostname");
        });
    }

    acceptHost(hostname, saltfingerprint: { saltfingerprint: string }) {
        return this.restFull.all('nodes').post(saltfingerprint);
    }

    // **get**
    // **@returns** a promise with this specific server's metadata.
    get(id) {
        return this.rest.one('nodes', id).get().then(function(server) {
            return server;
        });
    }

    // **getByHostname**
    // **@returns** a promise with this specific server's metadata.
    getByHostname(hostname) {
        return this.getList().then(function(servers) {
            return _.find(servers, function(server) {
                return server.hostname === hostname;
            });
        });
    }

    // **add**
    // **@returns** a promise with the request id for the operation.
    add(host) {
        return this.restFull.all('nodes').post(host);
    }

    // **updateDiskStorageProfile**
    // **@returns** status of the http request.
    updateDiskStorageProfile(nodeid: string, diskid: string, storageprofile: string) {
        return this.restFull.one('nodes', nodeid).one('disks', diskid).customPUT({ storageprofile: storageprofile });
    }

    // **getGrains**
    // **@returns** a promise with the metadata, key value pairs associated with
    // this specific server, aka grains in Salt Stack parlance.
    // **@see** http://docs.saltstack.com/en/latest/topics/targeting/grains.html
    getGrains(id) {
        return this.rest.one('server', id).one('grains').get().then(function(server) {
            return server;
        });
    }

    // **getStorageDevices**
    // **@returns** a promise with all storage devices in the server.
    getStorageDevices(hostId) {
        return this.rest.one('hosts', hostId).all('storage-devices').getList().then(function(devices) {
            return devices;
        });
    }

    // **getDiskStorageDevices**
    // **@returns** a promise with all storage devices in the server.
    getDiskStorageDevices(hostId) {
        return this.rest.one('hosts', hostId).all('storage-devices').getList().then(function(devices) {
            return _.filter(devices, function(device) {
                return device.device_type === 'disk';
            });
        });
    }
   
    // **getStorageDevicesFree**
    // **@returns** a promise with all storage devices which are not being used in the server.
    getStorageDevicesFree(hostId, hostname) {
        return this.getStorageDevices(hostId).then(function(devices) {
            if (hostname) {
                _.each(devices, function(device) {
                    device.hostname = hostname;
                });
            }
            return _.filter(devices, function(device) {
                return device.inuse === false && device.device_type === 'disk';
            });
        });
    }

    public getCpuUtilization(nodeId) {
        return this.rest.one('nodes', nodeId).one('utilization').get({ resource: 'cpu', duration: '10s' });
    }

    public getMemoryUtilization(nodeId) {
        return this.rest.one('nodes', nodeId).one('utilization').get({ resource: 'memory', duration: '10s' });
    }

    public reinitialize(hostname){
        return this.restFull.one('nodes',hostname).all('actions').post({action: 'reinitialize'});
    }
    public delete(hostname){
        return this.restFull.one('nodes',hostname).all('actions').post({action: 'delete'});
    }
}
