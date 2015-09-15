// <reference path="../typings/tsd.d.ts" />
// <reference path="./cluster-modal.ts" />

import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util';
import {ClusterState} from './cluster-modals';
import {OpenstackService} from './cluster-modals';
import {KeyValue} from './cluster-modals';
import {Cluster} from './cluster-modals';
import {Node} from './cluster-modals';

export class ClusterHelper     {  
    public clusterTypes : Array<Cluster>;
    public openstackServices: Array<OpenstackService>;
    public clusterStates : Array<ClusterState>;
    
    constructor(private utilService : UtilService,
        private requestService : RequestService,
        private logService : ng.ILogService,
        private timeoutService : ng.ITimeoutService)    {

        //Different types of clusters.
        this.clusterTypes = [
            { ID: 1, type: 'gluster', desc: 'Gluster' },
            { ID: 2, type: 'ceph', desc: 'Ceph' }
        ];

        this.openstackServices = [
            { name: 'cinder', desc: 'Cinder (Block Volumes)' },
            { name: 'cinder-backup', desc: 'Cinder Backup (Block Volumes backup)' },
            { name: 'glance', desc: 'Glance (Images and Snapshots)' },
            { name: 'nova', desc: 'Nova (Ephemeral Storage)' },
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
    
    public getClusterType(type: string) {
        return _.find(this.clusterTypes, function(clusterType) {
            return clusterType.type === type;
        });
    }

    public getOpenStackServices(): Array<OpenstackService> {
        return this.openstackServices;
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
       
        var saltfingerprint = {
            saltfingerprint: host.saltfingerprint
        };
        
        this.utilService.acceptHost(host.hostname, saltfingerprint).then((result) => {
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
        // this.utilService.acceptHosts(hosts).then((result) => {
        //     this.logService.info(result);
        //     host.state = "ACCEPTING";
        //     host.task = result;
        //     this.callBack(cluster, host, result);
        //     this.timeoutService(()=>this.callBack(cluster,host,result), 5000);
        // });
    }    
    
    /**
     * This function helps in adding a  new host with all its properties.
    */
    public addNewHost(cluster : any, severService: ServerService)    {
         var newHost = cluster.newHost;
         newHost.isVerifyingHost = true;
         newHost.errorMessage = "";    
         newHost.cautionMessage = "";
         var hostObject = {
             "hostname": newHost.hostname,
             "sshfingerprint": newHost.fingerprint,
             "user": newHost.username,
             "password": newHost.password
         };
        //This called on success[promise].
        severService.add(hostObject).then( () => {
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
