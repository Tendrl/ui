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
        this.$log.debug('Creating Request Tracking Service [' + this.id + ']');
        this.requests = new IDBStore({
            dbVersion: 1,
            storeName: 'UserRequest',
            keyPath: 'id',
            autoIncrement: false,
            onStoreReady: () => {
                this.$log.info('UserRequest store is ready!');
                this.timeout = $timeout(() => this.processRequests(), this.timer);
            },
            onError: () => {
                this.$log.error('Unable to create UserRequest store');
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
                done: false,
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
        d.promise.then((id) => {
            this.$log.info('Removed request id ' + id);
        }, (error) => {
            this.$log.error('Error in removing request id ' + id);
        });
        return d.promise;
    }

    public update(id, request) {
        var d = this.$q.defer();
        this.requests.put(request, d.resolve, d.reject);
        d.promise.then((id) => {
            this.$log.info('Updated request id ' + id);
        }, (error) => {
            this.$log.error('Error in updating request id ' + id);
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
        this.$log.debug('Refreshing the requests in the store');
        this.getTrackedRequests().then((requests) => {
            _.each(requests, (trackedRequest: any) => {
                if(!trackedRequest.done) {
                    this.requestSvc.get(trackedRequest.id).then((task) => {
                        if (task.status === 'FAILED') {
                            this.showError(trackedRequest.operation + ' is failed');
                            this.$log.error(trackedRequest.operation + ' is failed');
                            this.remove(trackedRequest.id);
                        }
                        else if (task.Completed) {
                            this.showNotification(trackedRequest.operation + ' is completed sucessfully');
                            this.$log.info(trackedRequest.operation + ' is completed sucessfully');
                            trackedRequest.done = true;
                            this.update(trackedRequest.id, trackedRequest);
                        }
                        else if (!task.Completed) {
                            this.$log.info('Request ' + trackedRequest.id + ' is in progress');
                            this.update(trackedRequest.id, trackedRequest);
                        }
                    }, (resp) => {
                        if (resp.status === 404) {
                            this.$log.warn('Request ' + trackedRequest.id + ' NOT FOUND');
                            this.remove(trackedRequest.id);
                        }
                    });
                }
            });
        });
        this.timeout = this.$timeout(() => this.processRequests(), this.timer);
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
