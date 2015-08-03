// <reference path="../typings/tsd.d.ts" />
// <reference path="./cluster-modal.ts" />

import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util';
import {ClusterState} from './cluster-modals';
import {KeyValue} from './cluster-modals';
import {Cluster} from './cluster-modals';
import {Node} from './cluster-modals';

export class ClusterHelper     {  
    public storgeTypes : Array<KeyValue>;
    public clusterTypes : Array<Cluster>;
    public clusterStates : Array<ClusterState>;
    
    constructor(private utilService : UtilService,
        private requestService : RequestService,
        private logService : ng.ILogService,
        private timeoutService : ng.ITimeoutService)    {
        
        //Different types of Storages.    
        this.storgeTypes = [
            { ID:1, type:'Block' },
            { ID:2, type:'File' },
            { ID:3, type:'Object' }
        ];
        
        //Different types of clusters.
        this.clusterTypes = [
            {   ID : 1, 
                type : 'Gluster', 
                deploymentTypes :[
                    { ID:1, type:'Demo (2 nodes)', nodeCount:2 },
                    { ID:2, type:'Minimum (3 nodes)', nodeCount:3 },
                    { ID:3, type:'Basic (more than 3 nodes)', nodeCount:3 },
                    { ID:4, type:'Standard (6 nodes)', nodeCount:6 },
                    { ID:5, type:'Big (more than 6 nodes)',nodeCount:6}
                ],
                workLoads : [
                    { ID:0, type: 'Generic' },
                    { ID:1, type: 'Hadoop' },
                    { ID:2, type: 'Virtualization' },
                    { ID:3, type: 'OpenStack (Glance)' }
                ]
            },
            {
                ID :2,
                type : 'Ceph', 
                deploymentTypes :[
                    { ID:1, type:'Demo (2 nodes)', nodeCount:2 },
                    { ID:2, type:'Minimum (3 nodes)', nodeCount:3 },
                    { ID:3, type:'Basic (more than 3 nodes)', nodeCount:3 },
                    { ID:4, type:'Standard (10 nodes)', nodeCount:10 },
                    { ID:5, type:'Big (more than 10 nodes)',nodeCount:10}
                ],
                workLoads : [
                    { ID:0, type: 'Generic' },
                    { ID:1, type: 'OpenStack (with Swift)' },
                    { ID:2, type: 'OpenStack (without Swift)' }
                ]
            }
        ];
        
        //This property indicates the states that a cluster can have.
        this.clusterStates = [
            { ID:1, state:'Inactive'},
            { ID:2, state:'Not Available'},
            { ID:3, state:'Active'},
            { ID:4, state:'Creating'},
            { ID:5, state:'Failed'}
        ];
    }

    public  getClusterTypes() : Array<Cluster>{
        return this.clusterTypes;
    }
    
    public  getClusterType(id : number){
        return _.find(this.clusterTypes, function(type) {
            return type.ID === id;
        });    
    }
    
    public getStorageTypes() : Array<KeyValue> {
        return this.storgeTypes;
    }
    
    public getStorageType(id : number) : KeyValue    {
        return _.find(this.storgeTypes, function(type) {
            return type.ID === id;
        });
    }
    
    public getClusterStatus(id : number)  : ClusterState{
        return _.find(this.clusterStates, function(type) {
            return type.ID === id;
        });
    }
    
    public callBack(cluster :any,  host : any, result : any) {
        this.requestService.get(result).then((request) => {
            if(request.status === "FAILED" || request.status === "FAILURE")    {
                this.logService.info('Failed  to accept host ' + host.hostname);
                host.state = "FAILED";
                host.task = undefined;
            } else if(request.status === "SUCCESS")    {
                this.logService.info('Accepted Host ' + host.hostname);
                host.state = "ACCEPTED";
                host.task = undefined;
                    cluster.postAcceptHost(host);
            } else {
                this.logService.info('Accepting Host ' + host.hostname);
                this.timeoutService(()=>this.callBack(cluster,host,result), 5000);
            }
        });
    }
    
    /**
     * This function helps in accepting a host that already exsist.
     */
    public acceptHost(cluster : any, host : any)    {
        var hosts : Array<any> = [];
        hosts = [
            {
                node_name : host.hostname,
                management_ip : host.ipaddress
            }
        ];
        
         this.utilService.acceptHosts(hosts).then((result) => {
            this.logService.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            this.callBack(cluster, host, result);
            this.timeoutService(()=>this.callBack(cluster,host,result), 5000);  
        });
    }
    
    /**
     * This function helps in accepting a new host that comes in.
     */
    public acceptNewHost(cluster : any,  host : any)    {
        var hosts : any;
        hosts = {
            nodes:[
               {
                    "node_name" : host.hostname,
                    "management_ip" : host.ipaddress,
                    "ssh_username" : host.username,
                    "ssh_password" : host.password,
                    "ssh_key_fingerprint" : host.fingerprint,
                    "ssh_port" :22
               }
            ]
        };     
        this.utilService.acceptHosts(hosts).then((result) => {
            this.logService.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            this.callBack(cluster, host, result);
            this.timeoutService(()=>this.callBack(cluster,host,result), 5000);
        });
    }    
    
    /**
     * This function helps in adding a  new host with all its properties.
    */
    public addNewHost(cluster : any)    {
         var newHost = cluster.newHost;
         newHost.isVerifyingHost = true;
         newHost.errorMessage = "";    
         newHost.cautionMessage = "";
         var hostObject = {
             "host": newHost.ipaddress,
             "port": 22,
             "fingerprint": newHost.fingerprint,
             "username": newHost.username,
             "password": newHost.password
         };
        //This called on success[promise].
        this.utilService.getVerifyHost(hostObject).then( () => {
            var host = {
                isMon : false,
                hostname: newHost.hostname, 
                username: newHost.username,
                password: newHost.password,
                ipaddress: newHost.ipaddress,
                fingerprint: newHost.fingerprint
            };
            //alert("here success");
            cluster.hosts.unshift(host);
            cluster.postAddNewHost(host);
            cluster.newHost = {};
        },
        //This a called on failure[promise].
         () => {
            cluster.newHost.cautionMessage = 'Authentication Error!.';
            cluster.newHost.errorMessage = " The username and password is incorrect.";
            cluster.newHost.isVerifyingHost = false;
        });
    }
}
