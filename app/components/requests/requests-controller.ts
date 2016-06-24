/// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

var idbWrapper = require('idb-wrapper');

import {UserService} from '../rest/user';
import {ServerService} from '../rest/server';
import {RequestTrackingService} from './request-tracking-svc';
import {UtilService} from '../rest/util';
import {RequestService} from '../rest/request';
import * as ModalHelpers from '../modal/modal-helpers';
import {EventService} from '../rest/events';
import {SystemService} from '../rest/system';
import {ConfigService} from '../rest/config';
export class RequestsController {
    private tasks;
    private events: Array<any>;
    private about: any;
    private discoveredHosts: Array<any>;
    private discoveredHostsLength: number;
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$timeout',
        '$location',
        '$log',
        '$modal',
        'ServerService',
        'UtilService',
        'EventService',
        'RequestService',
        'SystemService',
        'ConfigService',
        'RequestTrackingService',
        'UserService'];

    constructor(private $scope: any,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $modal: any,
        private serverSvc: ServerService,
        private utilSvc: UtilService,
        private eventsvc: EventService,
        private requestSvc: RequestService,
        private sysSvc: SystemService,
        private configSvc: ConfigService,
        private requestTrackingSvc: RequestTrackingService,
        private userSvc: UserService) {
        this.getAbout();
        this.events = [];
        this.tasks = {};
        this.discoveredHostsLength = 0;
        this.discoveredHosts = [];
        this.openWebSocket();
        this.loadEvents();
        this.$interval(() => this.reloadDiscoveredHosts(), 12000);
        this.$interval(() => this.reloadTasks(), 5000);
    }

    //Open WebSocket connection 
    public openWebSocket() {
        if ("WebSocket" in window) {
            var ws;
            if (this.$location.protocol() === "https") {
                ws = new WebSocket("wss://" + this.$location.host() + ":8081/ws");
            } else {
                ws = new WebSocket("ws://" + this.$location.host() + ":8081/ws");
            }
            ws.onopen = () => {
                this.$log.info("WebSocket Connection is Started!");
            };
            ws.onmessage = evt => {
                if (evt.data.length > 0) {
                    this.events.unshift(JSON.parse(evt.data));
                this.events =  _.filter(this.events, function(obj){
                   return obj["severity"] < 5;
                });
                }
            };
            ws.onclose = () => {
                this.$log.info("WebSocket Connection is Closed!");
                //fall back to periodic poll
                this.$interval(() => this.loadEvents(), 10000);
            };
        }
        else {
            this.$log.info("WebSocket is not supported by your Browser!");
            //fall back to periodic poll
            this.$interval(() => this.loadEvents(), 10000);
        }
    }

    public loadEvents() {
        this.eventsvc.getList(
            {
                "severity": ['minor', 'warning', 'indeterminate', 'critical', 'major'],
                "acked": "false"
            }).then((events) => {
                this.events = _.uniq(events.events, 'event_id');
            });
    }

    public reloadTasks() {
        this.requestTrackingSvc.getTrackedRequests().then((tasks: Array<any>) => {
            this.tasks = _.filter(tasks, task => !task.done);
        });
    }

    public viewTasks() {
        this.$location.path('/tasks');
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
            this.requestSvc.get(host.taskid).then((task) => {
                this.requestTrackingSvc.add(host.taskid, task.name);
            });
            var self = this;
            var callback = function() {
                self.requestSvc.get(host.taskid).then((task) => {
                    if (task.completed && task.status == 1) {
                        self.$log.info('Accepted host in first controller ' + host.hostname);
                        host.state = "ACCEPTED";
                        host.task = undefined;
                    }
                    else if (task.completed && task.status == 2) {
                        self.$log.info('Failed to accept host in first controller ' + host.hostname);
                        host.state = "UNACCEPTED";
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
        this.$modal({ scope: this.$scope, template: 'views/hosts/discovered-hosts.html', show: true });
    }

    public mySettings() {
        this.$modal({ scope: this.$scope, template: 'views/admin/my-settings.html', show: true });
    }

    public openAboutModal() {
        this.$modal({ scope: this.$scope, template: 'views/base/about-modal.html', show: true });
    }

    public acceptAllHosts() {
        _.each(this.discoveredHosts, (host: any) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }

    public getAbout() {
        this.sysSvc.getAboutDetails().then((aboutDetails) => {
            this.about = aboutDetails;
            return this.configSvc.getConfig();
        }).then((config) => {
            this.about.copyright = config.copyright;
        });
    }
}
