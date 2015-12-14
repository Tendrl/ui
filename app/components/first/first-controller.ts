/// <reference path="../../../typings/tsd.d.ts" />

import {ServerService} from '../rest/server';
import {RequestService} from '../rest/request';
import {UtilService} from '../rest/util';
import {RequestTrackingService} from '../requests/request-tracking-svc';

export class FirstController {
    discoveredHosts: Array<any>;
    static $inject: Array<string> = ['$location', '$log', '$timeout', 'ServerService', 'RequestService', 'UtilService', 'RequestTrackingService'];
    constructor(
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private serverSvc: ServerService,
        private requestSvc: RequestService,
        private utilSvc: UtilService,
        private requestTrackingSvc: RequestTrackingService) {
        this.discoveredHosts = [];
        this.serverSvc.getDiscoveredHosts().then((freeHosts) => {
            _.each(freeHosts, (freeHost: any) => {
                var host = {
                    hostname: freeHost.hostname,
                    saltfingerprint: freeHost.saltfingerprint,
                    state: "UNACCEPTED",
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

    public acceptHost(host: any): void {
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
                    if (task.completed) {
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

    public acceptAllHosts(): void {
        _.each(this.discoveredHosts, (host) => {
            if (host.state === "UNACCEPTED") {
                this.acceptHost(host);
            }
        });
    };
}
