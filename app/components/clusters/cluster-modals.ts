export interface ClusterState {
    ID: number;
    state: string;
}

export interface OpenstackService {
    name: string;
    desc: string;
}

export interface KeyValue {
    ID: number;
    type: string;
}

export interface Cluster {
    ID: number;
    type: string;
}

export interface Host {
    hostname: string;
    ipaddress: string;
    state: string;
    task: string;
    selected: boolean;
}

export interface Node {
    nodeName: string;
    managementIPAddress: string;
    sshUserName?: string;
    sshPassoword?: string;
    sshKeyFingerPrint?: string;
    sshPort?: number;
}

export interface Volume {
    copyCountList: Array<any>;
    copyCount: any;
    sizeUnits: Array<any>;
    sizeUnit: any;
}

export interface Pool {
    copyCountList: Array<any>;
    copyCount: any;
}
