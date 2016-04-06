// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {NodeState} from '../../rest/server';
import {ClusterService} from '../../rest/clusters';
import {RequestService} from  '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelper from '../../modal/modal-helpers';

export class ImportClusterController {
    private clusterSummary: any;
    private bootstrapNode: any;
    private freeHosts: Array<any>;
    private step: number;
    private error: string;

    static $inject: Array<string> = ['$log', '$modal', '$location', 'ClusterService', 'RequestService', 'RequestTrackingService', 'ServerService'];
    constructor(
        private logService: ng.ILogService,
        private modalService: any,
        private $location: ng.ILocationService,
        private clusterService: ClusterService,
        private requestService: RequestService,
        private requestTrackingService: RequestTrackingService,
        private serverService: ServerService) {
        this.loadAllFreeHosts();
        this.step = 1;
    }

    public loadAllFreeHosts() {
        this.serverService.getAllFreeHosts().then((freeHosts) => {
            this.freeHosts = freeHosts;
        });
    }

    public loadClusterDetails(): void {
        this.error = undefined;
        this.clusterService.getImportClusterDeatils(this.bootstrapNode.hostname).then((result) => {
            if (result.status === 200) {
                this.clusterSummary = result.data;
                this.step = 2;
                if (!this.clusterSummary.compatible) {
                    this.error = "Cluster with version '" + this.clusterSummary.version + "' is not compatible . Please ensure that Ceph 2.0 or greater is installed."
                }else if(!this.isAllHostsFound(this.clusterSummary)){
                    this.error = "One or more of the hosts in this cluster cannot be found. Please ensure that Ceph 2.0 or greater is installed on this host and that it is available on the network. Click Refresh to search for this host again."
                }
            } else {
                this.error = "Failed to retrive cluster information from the selected host '" + this.bootstrapNode.hostname + "'. Please select a monitor host and try again";
            }
        }, (error) => {
            this.error = "Failed to retrive cluster information from the selected host '" + this.bootstrapNode.hostname + "'. Please select a monitor host and try again";
        });
    }

    private isAllHostsFound(clusterSummary: any): boolean {
        return _.every(clusterSummary.nodes, (node: any) => node.found);
    }

    public import(): void {
        var nodes = _.map(this.clusterSummary.nodes, (node:any) => node.name);
        var cluster = { 'bootstrapnode': this.bootstrapNode.hostname, 'type': 'ceph', 'nodes': nodes };
        this.clusterService.importCephCluster(cluster).then((result) => {
            if (result.status === 202) {
                this.requestService.get(result.data.taskid).then((task) => {
                    this.requestTrackingService.add(task.id, task.name);
                });
                var modal = ModalHelper.SuccessfulRequest(this.modalService, {
                    title: 'Import Cluster request is being processed',
                    container: '.usmClientApp'
                });
                modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
                    $hide();
                    this.$location.path('/tasks/' + result.data.taskid);
                });
            }
            else {
                this.logService.error('Failed to import the cluster:', result);
            }
        });
    }

    public cancel(): void {
        this.$location.path('/clusters');
    }
    public selectHost(host: any): void {
        this.bootstrapNode = host
    }
}