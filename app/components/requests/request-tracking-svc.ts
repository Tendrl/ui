/// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

var IDBStore = require('idb-wrapper');

import {RequestService} from '../rest/request';

export class RequestTrackingService {
    private id: number = 0;
    private timer: number = 5000;
    private timeout: any;
    private requests: any;
    static $inject: Array<string> = ['$q', '$log', '$timeout', 'RequestService', 'growl'];
    constructor(
        private $q: ng.IQService,
        private $log: ng.ILogService,
        private $timeout: ng.ITimeoutService,
        private requestSvc: RequestService,
        private growl: any) {
        this.id = this.id + 1;
        $log.debug('Creating Request Tracking Service [' + this.id + ']');
        var self = this;
        this.requests = new IDBStore({
            dbVersion: 1,
            storeName: 'UserRequest',
            keyPath: 'id',
            autoIncrement: false,
            onStoreReady: function() {
                $log.info('UserRequest store is ready!');
                self.timeout = $timeout(() => self.processRequests, this.timer);
            },
            onError: function() {
                $log.error('Unable to create UserRequest store');
            }
        });
    }

    public add(id, operation): ng.IPromise<string> {
        var d = this.$q.defer();
        if (id === null || id === undefined) {
            // resolve empty ids immediately
            d.resolve();
        }
        else {
            this.requests.put({
                id: id,
                operation: operation,
                timestamp: Date.now()
            }, (id) => {
                this.$log.info('Tracking new request ' + id);
                d.resolve(id);
            }, (error) => {
                this.$log.error('Error inserting request ' + id + ' error: ' + error);
                d.reject(error);
            });
        }
        return d.promise;
    }

    public remove(id) {
        var d = this.$q.defer();
        this.requests.remove(id, d.resolve, d.reject);
        d.promise.then(function() {
            this.$log.info('Removed request id ' + id);
        }, function(error) {
            this.$log.error('Error in removing request id ' + id);
        });
        return d.promise;
    }

    public getTrackedRequests() {
        var d = this.$q.defer();
        this.requests.getAll(d.resolve, d.reject);
        return d.promise;
    }

    public getLength() {
        var d = this.$q.defer();
        this.requests.count(d.resolve, d.reject);
        return d.promise;
    }

    public processRequests() {
        var self = this;
        RequestTrackingService.prototype.$log.debug('Refreshing the requests in the store');
        self.getTrackedRequests().then(function(requests) {
            _.each(requests, function(trackedRequest: any) {
                self.requestSvc.get(trackedRequest.id).then(function(request) {
                    if (request.status === 'FAILED' || request.status === 'FAILURE') {
                        self.showError(trackedRequest.operation + ' is failed');
                        self.$log.info(trackedRequest.operation + ' is failed');
                        self.remove(trackedRequest.id);
                    }
                    else if (request.status === 'SUCCESS') {
                        self.showNotification(trackedRequest.operation + ' is completed sucessfully');
                        self.$log.info(trackedRequest.operation + ' is completed sucessfully');
                        self.remove(trackedRequest.id);
                    }
                    else if (request.status === 'STARTED') {
                        self.$log.info('Request ' + trackedRequest.id + ' is in progress');
                    }
                    else if (request.status) {
                        self.$log.info('Request ' + trackedRequest.id + ' is in unknown state: ' + request.status);
                    }
                }, function(resp) {
                    if (resp.status === 404) {
                        self.$log.warn('Request ' + trackedRequest.id + ' NOT FOUND');
                        self.remove(trackedRequest.id);
                    }
                });
            });
        });
        this.timeout = this.$timeout(self.processRequests, this.timer);
    }

    public showError(msg) {
        // TODO: too tightly coupled use $broadcast
        this.growl.error('ERROR: ' + msg, {
            ttl: -1
        });
    }

    public showNotification(msg) {
        // TODO: too tightly coupled use $broadcast
        this.growl.success(msg);
    }
}
