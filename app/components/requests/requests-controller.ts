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
   private events : Array<any>;
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
        this.events = [];
        this.tasks = {};
        this.discoveredHostsLength = 0;
        this.discoveredHosts = [];
        this.loadEvents();
        this.$interval(() => this.reloadDiscoveredHosts(), 5000);
        this.$interval(() => this.reloadTasks(), 5000);
    }

    //Open WebSocket connection 
    public openWebSocket() {
        if ("WebSocket" in window) {
           var ws = new WebSocket("ws://"+this.$location.host()+":8081/ws");
           ws.onopen = function()
           {
              console.log("WebSocket Connection is Started!");
           };
           ws.onmessage = evt => {
              if(evt.data.length > 0) {
                this.events.unshift(JSON.parse(evt.data));
              }
           };
           ws.onclose = function()
           { 
              console.log("WebSocket Connection is Closed!"); 
           };
        } else {
           console.log("WebSocket NOT supported by your Browser!");
        }
    }

    //First time load all events after that push event handle by web socket 
    public loadEvents() {
        this.serverSvc.getEvents().then((events) => {
            this.events = events
            this.openWebSocket();
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
        document.getElementById("openDiscoveredHosts").click();
    }

    public mySettings(){
        document.getElementById("mySettings").click();
    }

    public acceptAllHosts() {
        _.each(this.discoveredHosts, (host: any) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    }
}
