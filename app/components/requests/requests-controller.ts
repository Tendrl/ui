/// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

var idbWrapper = require('idb-wrapper');

import {UserService} from '../rest/user';
import {ServerService} from '../rest/server';
import {RequestTrackingService} from './request-tracking-svc';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';

export class RequestsController {
   private tasks;
   private alerts : Array<any>;
   private discoveredHosts : Array<any>;
   private discoveredHostsLength: number;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$timeout',
        '$location',
        '$log',
        'ServerService',
        'UtilService',
        'RequestService',
        'RequestTrackingService',
        'UserService'];

    constructor(private $scope: any,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private serverSvc: ServerService,
        private utilSvc: UtilService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService,
        private userSvc: UserService) {
        this.alerts = [];
        this.tasks = {};
        this.discoveredHostsLength = 0;
        this.discoveredHosts = [];
        this.$interval(() => this.reloadDiscoveredHosts(), 5000);
        this.$interval(() => this.reloadTasks(), 5000);
    }

    public reloadAlerts() {
        this.serverSvc.getList().then((hosts) => {
            var alerts = [];
            _.each(hosts, (host: any) => {
                if (host.node_status === 1) {
                    alerts.push('Host ' + host.node_name + ' is down');
                }
            });
            this.alerts = alerts;
        });
    }

    public reloadTasks() {
        this.requestTrackingSvc.getTrackedRequests().then((tasks: Array<any>) => {
            this.tasks = _.filter(tasks, task => !task.done);
        });
    }

    public viewEvents() {
        this.$location.path('/events');
    }

    public logoutUser() {
        this.userSvc.logout().then((logout) => {
            document.location.href = '';
        });
    }

    public reloadDiscoveredHosts() {

        this.discoveredHosts = _.filter(this.discoveredHosts, (host: any) => {
            return host.state !== "ACCEPTED" && host.state !== "UNACCEPTED";
        });

        this.serverSvc.getDiscoveredHosts().then((freeHosts) => {

            this.discoveredHostsLength = freeHosts.length;

            _.each(freeHosts, (freeHost: any) => {
                var host = {
                    hostname: freeHost.hostname,
                    saltfingerprint: freeHost.saltfingerprint,
                    state: "UNACCEPTED",
                    selected: false
                };

                var isPresent = false;

                isPresent = _.some(this.discoveredHosts, (dHost: any) => {
                    return dHost.hostname === host.hostname;
                });

                if (!isPresent) {
                    this.discoveredHosts.push(host);
                }
            });
        });
    }

    public acceptHost(host) {
        var saltfingerprint = {
            saltfingerprint: host.saltfingerprint
        };

        this.utilSvc.acceptHost(host.hostname, saltfingerprint).then((result) => {
            this.$log.info(result);
            host.state = "ACCEPTING";
            host.taskid = result.data.taskid;
            this.requestTrackingSvc.add(host.taskid, 'Accepting host \'' + host.hostname + '\'');
            var self = this;
            var callback = function() {
                self.requestSvc.get(host.taskid).then((task) => {
                    if (task.Completed) {
                        self.$log.info('Accepted host in first controller ' + host.hostname);
                        host.state = "ACCEPTED";
                        host.task = undefined;
                    }
                    else {
                        self.$log.info('Accepting host in first controller ' + host.hostname);
                        self.$timeout(callback, 5000);
                    }
                });
            }
            this.$timeout(callback, 5000);
        });
    }

    public openDiscoveredHostsModel() {
        document.getElementById("openDiscoveredHosts").click();
    }

    public acceptAllHosts() {
        _.each(this.discoveredHosts, (host: any) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }
}
