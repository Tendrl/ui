export interface Cluster {
    clusterid: string;
    name: string;
    compat_version: string;
    type: string;
    workload: string;
    status: number;
    tags: Array<string>;
    options: {};
    openstack_services: Array<string>;
    networks: {};
    enabled: boolean;
}
