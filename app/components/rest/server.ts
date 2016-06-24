/// <reference path="../../../typings/tsd.d.ts" />

export interface Node {
    roles: Array<string>;
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
    tags: any[];
    utilizations: { cpuusage: UsageData, memoryusage: UsageData, storageusage: UsageData, swapusage: UsageData, networkusage: UsageData };
}

export interface UsageData {
    used: number;
    total: number;
    percentused?: number;
    updatedat?: any;
}

export interface DashboardSummaryData {
     name: string;
     usage: UsageData;
     storageprofileusage: { general?: { isFull:boolean, isNearFull: boolean, utilization: UsageData }, sas?: { isFull:boolean, isNearFull: boolean, utilization: UsageData }, ssd?: { isFull:boolean, isNearFull: boolean, utilization: UsageData } };
     storagecount: { criticalAlerts: number, down: number, total:number };
     slucount: { criticalAlerts: number, down: number, error: number, nearfull: number, total: number };
     nodescount: { criticalAlerts: number, error: number, total: number, unaccepted: number };
     clusterscount: { criticalAlerts: number, error: number, nearfull: number, total: number };
     providermonitoringdetails: { ceph: { monitor: { criticalAlerts: number, down: number, total: number }, objects: { num_objects: number, num_objects_degraded: number }, pgnum: { total: number, error: number, warning: number } } };
     storageusage: Array<{ name: string, usage: UsageData }>;
     utilizations: { cpupercentageusage: number, memoryusage: UsageData };
     monitoringplugins: { storage_profile_utilization: { name: string, enable: boolean, configs: Array<{ category: string, type: string, value: number }> } };
}

enum AlarmStatus {
    INDETERMINATE,  //0
    CRITICAL,       //1
    MAJOR,          //2
    MINOR,          //3
    WARNING,        //4
    CLEARED         //5
}

export enum NodeState {
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

    // **getFilteredList**
    // **@returns** a promise with all servers with query string.
    getFilteredList(queryString) {
        if(queryString != undefined){
            queryString = "?" + queryString;
        }else{
            queryString = "";
        }
        return this.rest.all('nodes' + queryString).getList<Node>().then(function(servers) {
            return _.sortBy(servers, "hostname");
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

    // **getFilteredListByCluster**
    // **@returns** a promise with all nodes part of the cluster with query string.
    getFilteredListByCluster(clusterId, queryString) {
        if(queryString != undefined){
            queryString = "?" + queryString;
        }else{
            queryString = "";
        }
        return this.rest.one('clusters', clusterId).all('nodes'+queryString).getList<Node>().then(function(nodes) {
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

    // **getAllFreeHosts**
    // **@returns** a promise with all free servers including the unaccepted Hosts.
    getAllFreeHosts() {
        return this.rest.all('nodes').getList<Node>({ state: 'free' }).then(function(servers) {
            return _.sortBy(servers, "state");
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

    // **getSystemOverallUtilization**
    // **@returns** a promise with Overall Utilization across all the nodes in system.
    getSystemOverallUtilization() {
        return this.rest.all('monitoring/system/utilization?resource=system_utilization.percent_bytes').getList().then(function(overall_utilization) {
            return overall_utilization;
        });
    }

    // **getSystemCpuUtilization**
    // **@returns** a promise with Average CPU Utilization across all the nodes in system.
    getSystemCpuUtilization(time_slot) {
        return this.rest.all('monitoring/system/utilization?resource=cpu-user&duration='+time_slot).getList().then(function(cpu_utilization) {
            return cpu_utilization;
        });
    }

    // **getSystemMemoryUtilization**
    // **@returns** a promise with Average Memory Utilization across all the nodes in system.
    getSystemMemoryUtilization(time_slot) {
        return this.rest.all('monitoring/system/utilization?resource=memory-usage_percent&duration='+time_slot).getList().then(function(memory_utilization) {
            return memory_utilization;
        });
    }

    // **getIOPS**
    // **@returns** a promise with disks IOPS.
    getIOPS(time_slot) {
        return this.rest.all('monitoring/system/utilization?resource=disk-read_write&duration='+time_slot).getList().then(function(iops) {
            return iops;
        });
    }

    // **getThroughput**
    // **@returns** a promise with network throughput.
    getThroughput(time_slot) {
        return this.rest.all('monitoring/system/utilization?resource=interface-rx_tx&duration='+time_slot).getList().then(function(throughput) {
            return throughput;
        });
    }

    // **getNetworkLatency**
    // **@returns** a promise with network latency.
    getNetworkLatency(time_slot) {
        return this.rest.all('monitoring/system/utilization?resource=network_latency&duration='+time_slot).getList().then(function(network_latency) {
            return network_latency;
        });
    }

    public reinitialize(hostname){
        return this.restFull.one('nodes',hostname).all('actions').post({action: 'reinitialize'});
    }

    public delete(hostname){
        return this.restFull.one('nodes',hostname).all('actions').post({action: 'delete'});
    }

    // **getHostSummary**
    // **@returns** a promise with all details of host dashboard.
    getHostSummary(hostId) {
        return this.rest.one('nodes/'+ hostId +'/summary').get().then(function(host_summary) {
            return host_summary;
        });
    }

    // **getHostCpuUtilization**
    // **@returns** a promise with host's cpu utilization.
    getHostCpuUtilization(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=cpu.percent-user&duration='+time_slot).getList().then(function(cpu_utilization) {
            return cpu_utilization;
        });
    }

    // **getHostMemoryUtilization**
    // **@returns** a promise with host's memory utilization.
    getHostMemoryUtilization(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=memory.percent-used&duration='+time_slot).getList().then(function(memory_utilization) {
            return memory_utilization;
        });
    }

    // **getHostSwapUtilization**
    // **@returns** a promise with host's swap utilization.
    getHostSwapUtilization(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=swap.percent-used&duration='+time_slot).getList().then(function(swap_utilization) {
            return swap_utilization;
        });
    }

    // **getHostStorageUtilization**
    // **@returns** a promise with host's storage utilization.
    getHostStorageUtilization(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=storage_utilization.percent_bytes&duration='+time_slot).getList().then(function(storage_utilization) {
            return storage_utilization;
        });
    }

    // **getHostNetworkUtilization**
    // **@returns** a promise with host's network utilization.
    getHostNetworkUtilization(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=interface-average.percent-network_utilization&duration='+time_slot).getList().then(function(network_utilization) {
            return network_utilization;
        });
    }

    // **getHostIOPS**
    // **@returns** a promise with disks IOPS for host.
    getHostIOPS(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=disk-read_write&duration='+time_slot).getList().then(function(iops) {
            return iops;
        });
    }

    // **getHostThroughput**
    // **@returns** a promise with network throughput for host.
    getHostThroughput(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=interface-rx_tx&duration='+time_slot).getList().then(function(throughput) {
            return throughput;
        });
    }

    // **getHostNetworkLatency**
    // **@returns** a promise with network latency for host.
    getHostNetworkLatency(nodeid, time_slot) {
        return this.rest.all('monitoring/node/'+nodeid+'/utilization?resource=ping.ping-*&duration='+time_slot).getList().then(function(network_latency) {
            return network_latency;
        });
    }

    // **getNodeSlus**
    // **@returns** a promise with all slus of the node.
    getNodeSlus(nodeId) {
        return this.rest.one('nodes', nodeId).all('slus').getList<any>().then(function(slus) {
            return slus;
        });
    }

}
