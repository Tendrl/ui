// <reference path="../typings/tsd.d.ts" />
// <reference path="./cluster-modal.ts" />

import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util';
import {ClusterState} from './cluster-modals';
import {KeyValue} from './cluster-modals';
import {Cluster} from './cluster-modals';
import {Node} from './cluster-modals';

export class ClusterHelper     {
    private self = this;    
    static $inject: Array<string> = ['UtilService', 'RequestService', '$log', '$timeout'];
    public static storgeTypes : Array<KeyValue>;
    public static clusterTypes : Array<Cluster>;
    public static clusterStates : Array<ClusterState>;
    
    constructor(private utilService : UtilService,
        private requestService : RequestService,
        private logService : ng.ILogService,
        private timeoutService : ng.ITimeoutService)    {
        
        //Different types of Storages.    
        ClusterHelper.storgeTypes = [
            { id:1, type:'Block' },
            { id:2, type:'File' },
            { id:3, type:'Object' }
        ];
        
        //Different types of clusters.
        ClusterHelper.clusterTypes = [
            {    id : 1, 
                type : 'Gluster', 
                deploymentType :[
                    { id:1, type:'Demo (2 nodes)', nodeCount:2 },
                    { id:2, type:'Minimum (3 nodes)', nodeCount:3 },
                    { id:3, type:'Basic (more than 3 nodes)', nodeCount:3 },
                    { id:4, type:'Standard (6 nodes)', nodeCount:6 },
                    { id:5, type:'Big (more than 6 nodes)',nodeCount:6}
                ],
                workLoads : [
                    { id:0, type: 'Generic' },
                    { id:1, type: 'Hadoop' },
                    { id:2, type: 'Virtualization' },
                    { id:3, type: 'OpenStack (Glance)' }
                ]
            },
            {
                id :2,
                type : 'Ceph', 
                deploymentType :[
                    { id:1, type:'Demo (2 nodes)', nodeCount:2 },
                    { id:2, type:'Minimum (3 nodes)', nodeCount:3 },
                    { id:3, type:'Basic (more than 3 nodes)', nodeCount:3 },
                    { id:4, type:'Standard (10 nodes)', nodeCount:10 },
                    { id:5, type:'Big (more than 10 nodes)',nodeCount:10}
                ],
                workLoads : [
                    { id:0, type: 'Generic' },
                    { id:1, type: 'OpenStack (with Swift)' },
                    { id:2, type: 'OpenStack (without Swift)' }
                ]
            }
        ];
        
        //This property indicates the states that a cluster can have.
        ClusterHelper.clusterStates = [
            { id:1, state:'Inactive'},
            { id:2, state:'Not Available'},
            { id:3, state:'Active'},
            { id:4, state:'Creating'},
            { id:5, state:'Failed'}
        ];
    }

    public static getClusterTypes() : Array<Cluster>{
        return ClusterHelper.clusterTypes;
    }
    
    public static getClusterType(id : number) : Cluster{
        return _.find(ClusterHelper.clusterTypes, function(type) {
            return type.id === id;
        });    
    }
    
    public static getStorageTypes()    : Array<KeyValue> {
        return ClusterHelper.storgeTypes;
    }
    
    public static getStorageType(id : number) : KeyValue    {
        return _.find(ClusterHelper.storgeTypes, function(type) {
            return type.id === id;
        });
    }
    
    public static getClusterStatus(id : number)  : ClusterState{
        return _.find(ClusterHelper.clusterStates, function(type) {
            return type.id === id;
        });
    }
    
    callBack(cluster :any,  host : any, result : any) {
        this.requestService.get(result).then((request) => {
            if(request.status === "FAILED" || request.status === "FAILURE")    {
                this.logService.info('Failed  to accept host ' + host.hostName);
                host.state = "FAILED";
                host.task = undefined;
            } else if(request.status === "SUCCESS")    {
                this.logService.info('Accepted Host ' + host.hostName);
                host.state = "ACCEPTED";
                host.task = undefined;
                cluster.postAcceptHost(host);
            } else {
                this.logService.info('Accepting Host ' + host.hostName);
                this.timeoutService(this.callBack, 5000);
            }
        });
    }
    
    /**
     * This function helps in accepting a host that already exsist.
     */
    public acceptHost(cluster : any, host : any)    {
        var hosts : Array<Node>;
        hosts = [
            {
                nodeName : host.hostName,
                managementIPAddress : host.ipAddress
            }
        ];
        
         this.utilService.acceptHosts(hosts).then((result) => {
            this.logService.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            (cluster, host, result) => this.callBack(cluster, host, result);
            this.timeoutService(this.callBack, 5000);  
        });
    }
    
    /**
     * This function helps in accepting a new host that comes in.
     */
    public acceptNewHost(cluster : any,  host : any)    {
        var hosts : Array<Node>;
        hosts = [
            {
                nodeName : host.hostName,
                managementIPAddress : host.ipAddress,
                sshUserName : host.userName,
                sshPassoword : host.password,
                sshKeyFingerPrint : host.fingerPrint,
                sshPort :22
            }
        ];     
        
        this.utilService.acceptHosts(hosts).then((result) => {
            this.logService.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            (cluster, host, result) => this.callBack(cluster, host, result);
            this.timeoutService(this.callBack, 5000);
        });
    }    
    
    /**
     * This function helps in adding a  new host with all its properties.
    */
    public addNewHost(cluster : any)    {
         var newHost = cluster.newHost;
         newHost.isVerifyingHost = true;
         newHost.errorMsg = "";    
         newHost.cautionMsg = "";
         var hostObject = {
             "host": newHost.ipaddress,
             "port": 22,
             "fingerprint": newHost.fingerprint,
             "username": newHost.username,
             "ssh_password": newHost.password
         };
        
        //This called on success[promise].
        this.utilService.getVerifyHost(hostObject).then( () => {
            var host = {
                isMon : false,
                username: newHost.username,
                password: newHost.password,
                ipaddress: newHost.ipaddress,
                fingerprint: newHost.fingerprint
            };
            cluster.hosts.unshift(host);
            cluster.postAddNewHost(host);
            cluster.newHost = {};
        },
        //This a called on failure[promise].
         () => {
            cluster.newHost.cautionMsg = 'Authentication Error!.';
            cluster.newHost.errorMsg = " The username and password is incorrect.";
            cluster.newHost.isVerifyingHost = false;
        });
    }
}
