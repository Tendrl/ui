// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util'
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class AcceptHostsController {
    private discoveredHosts: Array<any>;
    private hostsBeingAccepted: Array<any>;
    private expandcluster:string;
    private from:string;
    private timer;
    static $inject: Array<string> = ['$location', '$scope', '$interval', '$log', '$timeout', '$modal', 'ServerService', 'RequestService', 'UtilService', 'RequestTrackingService'];
    constructor(
        private $location: ng.ILocationService,
        private $scope: ng.IScope,
        private $interval: ng.IIntervalService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private $modal,
        private serverSvc: ServerService,
        private requestSvc: RequestService,
        private utilSvc: UtilService,
        private requestTrackingSvc: RequestTrackingService) {
        var queryParams = this.$location.search();
        this.expandcluster = queryParams['expandcluster'];
        this.from = queryParams['from'];
        this.discoveredHosts = [];
        this.hostsBeingAccepted = [];
        this.timer = this.$interval(() => this.refreshHostsStatus(), 5000);
        this.$scope.$on('$destroy', () => {
            this.$interval.cancel(this.timer);
        });
        this.serverSvc.getDiscoveredHosts().then((discoverdHosts) => {
            _.each(discoverdHosts, (discoverdHost: any) => {
                var host = {
                    hostname: discoverdHost.hostname,
                    fingerPrint: discoverdHost.saltfingerprint,
                    state: "UNACCEPTED",
                    progress: 0
                };
                this.discoveredHosts.push(host);
            })
        })
    }

    public refreshHostsStatus() {
        _.each(this.hostsBeingAccepted, (host) => {
            if (host.state === "ACCEPTING") {
                this.requestSvc.get(host.taskid).then((task) => {
                    if (task.completed && task.status === 1) {
                        //Getting the initializing task for the particular host. Even if there are many failed initializing tasks for a given host, first one should be
                        //either in progress task and last updated task.
                        this.requestSvc.getList(undefined, undefined, undefined, undefined, undefined, 'Initialize Node: ' + host.hostname).then((data) => {
                            if (data.totalcount > 0) {
                                host.taskid = data.tasks[0].id;
                                this.$log.info('Accepted host ' + host.hostname + ' in Accept Hosts Controller ');
                                host.state = "INITIALIZING";
                                host.progress = 2;
                            }
                        });
                    }
                    else if (task.completed && (task.status === 2 || task.status === 3)) {
                        this.$log.info('Failed to accept host ' + host.hostname + ' in Accept Hosts Controller ');
                        host.state = "FAILED";
                    }
                });
            }
            else if (host.state === "INITIALIZING") {
                this.requestSvc.get(host.taskid).then((task) => {
                    if (task.completed && task.status === 1) {
                        this.$log.info('Initialized host ' + host.hostname + ' in Accept Hosts Controller ');
                        host.state = "INITIALIZED";
                        host.progress = 3;
                        host.lastupdated = task.statuslist[task.statuslist.length - 1].Timestamp;
                    }
                    else if (task.completed && (task.status === 2 || task.status === 3)) {
                        this.$log.info('Failed to initialize host ' + host.hostname + ' in Accept Hosts Controller');
                        host.state = "FAILED";
                        host.progress = 3;
                        host.lastupdated = task.statuslist[task.statuslist.length - 1].Timestamp;
                    }
                });
            }
        });
    }

    public acceptAllHosts() {
        _.each(this.discoveredHosts, (host) => {
            if (host.state === 'UNACCEPTED') {
                this.acceptHost(host);
            }
        })
    }

    public acceptHost(host) {
        var saltfingerprint = {
            saltfingerprint: host.fingerPrint
        };

        this.utilSvc.acceptHost(host.hostname, saltfingerprint).then((result) => {
            this.$log.info(result);
            this.hostsBeingAccepted.push(host);
            host.state = "ACCEPTING";
            host.progress = 1;
            host.taskid = result.data.taskid;
        });
    }

    public showAcceptTaskDetails(host) {
        this.showTaskDetailsModal(host.taskid);
    }

    private showTaskDetailsModal(taskId) {
        return this.$modal({
            template: 'views/modal/task-details-popup.html',
            backdrop: 'static', // disable mouse clicks for now since I can't wrap them or supply a callback
            keyboard: false,
            controller: function() {
                this.taskId = taskId;
            },
            controllerAs: 'tasks'
        });
    }

    public reinitialize(host) {
        this.serverSvc.reinitialize(host.hostname).then((result) => {
            if (result.status === 200) {
                host.taskid = result.data.taskid;
                host.state = "INITIALIZING";
            }
        });
    }

    public hostsFailedToInitialize() {
        return _.filter(this.discoveredHosts, host => host.state === 'FAILED').length;
    }

    public hostsInitialized() {
        return _.filter(this.discoveredHosts, host => host.state === 'INITIALIZED').length;
    }

    public hostsInProgress() {
        return _.filter(this.discoveredHosts, host => (host.state === 'ACCEPTING' || host.state === 'INITIALIZING')).length;
    }

    public continue() {
        this.$location.search({});
        if (this.expandcluster !== undefined) {
            this.$location.path('/clusters/expand/' + this.expandcluster).search('hostsaccepted', 'true');
        } else {
            this.$location.path('/clusters/new').search('hostsaccepted', 'true');
        }
    }

    public cancel() {
        this.$location.search({});
        if (this.from !== undefined) {
            this.$location.path(this.from);
        } else {
            this.$location.path('/clusters');
        }
    }
}