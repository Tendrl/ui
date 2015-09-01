/// <reference path="../../../typings/tsd.d.ts" />

import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util';

export class FirstController {
    discoveredHosts: Array<any>;
    static $inject: Array<string> = ['$location', '$log', '$timeout', 'ServerService', 'RequestService', 'UtilService'];
    constructor(
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private serverSvc: ServerService,
        private requestSvc: RequestService,
        private utilSvc: UtilService) {
        this.discoveredHosts = [];
        this.serverSvc.getDiscoveredHosts().then((freeHosts) => {
            _.each(freeHosts, (freeHost: any) => {
                var host = {
                    hostname: freeHost.node_name,
                    ipaddress: freeHost.management_ip,
                    state: "UNACCEPTED",
                    selected: false
                };
                this.discoveredHosts.push(host);
            });
        });
    }

    createCluster(): void {
        this.$location.path('/clusters/new');
    }

    importCluster(): void {
        this.$location.path('/clusters/import');
    }

    acceptHost(host: any): void {
        var hosts = {
            nodes: [
                {
                    node_name: host.hostname,
                    management_ip: host.ipaddress
                }
            ]
        };
        this.utilSvc.acceptHosts(hosts).then((result) => {
            this.$log.info(result);
            host.state = "ACCEPTING";
            host.task = result;
            var self = this;
            var callback = function() {
                self.requestSvc.get(result).then((request) => {
                    if (request.status === 'FAILED' || request.status === 'FAILURE') {
                        self.$log.info('Failed to accept host in first controller' + host.hostname);
                        host.state = "FAILED";
                        host.task = undefined;
                    }
                    else if (request.status === 'SUCCESS') {
                        self.$log.info('Accepted host in first controller ' + host.hostname);
                        host.state = "ACCEPTED";
                        host.task = undefined;
                    }
                    else {
                        self.$log.info('Accepting host in first controller' + host.hostname);
                        self.$timeout(callback, 5000);
                    }
                });
            }
            this.$timeout(callback, 5000);
        });
    }

    acceptAllHosts(): void {
        _.each(this.discoveredHosts, function(host) {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    };
}
