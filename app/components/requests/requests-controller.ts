/// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

var idbWrapper = require('idb-wrapper');

import {UserService} from '../rest/user';
import {ServerService} from '../rest/server';
import {RequestTrackingService} from './request-tracking-svc';

export class RequestsController {
    static $inject: Array<string> = [
        '$scope',
        '$interval',
        '$timeout',
        '$log',
        'ServerService',
        'UtilService',
        'RequestService',
        'RequestTrackingService',
        'UserService'];
    constructor(
        $scope: any,
        $interval: ng.IIntervalService,
        $timeout: ng.ITimeoutService,
        $log: ng.ILogService,
        serverSvc: ServerService,
        utilSvc: any,
        requestSvc: any,
        requestTrackingService: RequestTrackingService,
        userSvc: UserService) {

        $scope.alerts = [];
        $scope.tasks = [];
        $scope.discoveredHostsLength = 0;
        $scope.discoveredHosts = [];

        $scope.reloadAlerts = function() {
            serverSvc.getList().then(function(hosts) {
                var alerts = [];
                _.each(hosts, function(host: any) {
                    if (host.node_status === 1) {
                        alerts.push('Host ' + host.node_name + ' is down');
                    }
                });
                $scope.alerts = alerts;
            });
        }

        $scope.reloadTasks = function() {
            requestTrackingService.getTrackedRequests().then(function(tasks) {
                $scope.tasks = tasks;
            });
        }


        $scope.logoutUser = function() {
            userSvc.logout().then(function(logout) {
                document.location.href = '';
            });
        }

        $scope.reloadDiscoveredHosts = function() {

            $scope.discoveredHosts = _.filter($scope.discoveredHosts, function(host: any) {
                return host.state !== "ACCEPTED" && host.state !== "UNACCEPTED";
            });

            serverSvc.getDiscoveredHosts().then(function(freeHosts) {

                $scope.discoveredHostsLength = freeHosts.length;

                _.each(freeHosts, function(freeHost: any) {
                    var host = {
                        hostname: freeHost.node_name,
                        ipaddress: freeHost.management_ip,
                        state: "UNACCEPTED",
                        selected: false
                    };

                    var isPresent = false;

                    isPresent = _.some($scope.discoveredHosts, function(dHost: any) {
                        return dHost.hostname === host.hostname;
                    });

                    if (!isPresent) {
                        $scope.discoveredHosts.push(host);
                    }
                });
            });
        }

        $scope.acceptHost = function(host) {
            var hosts = {
                nodes: [
                    {
                        node_name: host.hostname,
                        management_ip: host.ipaddress
                    }
                ]
            };

            utilSvc.acceptHosts(hosts).then(function(result) {
                $log.info(result);
                host.state = "ACCEPTING";
                host.task = result;
                var callback = function() {
                    requestSvc.get(result).then(function(request) {
                        if (request.status === 'FAILED' || request.status === 'FAILURE') {
                            $log.info('Failed to accept host in requests controller' + host.hostname);
                            host.state = "FAILED";
                            host.task = undefined;
                        }
                        else if (request.status === 'SUCCESS') {
                            $log.info('Accepted host in requests controller ' + host.hostname);
                            host.state = "ACCEPTED";
                            host.task = undefined;
                        }
                        else {
                            $log.info('Accepting host in requests controller' + host.hostname);
                            $timeout(callback, 5000);
                        }
                    });
                }
                $timeout(callback, 5000);
            });
        };

        $scope.openDiscoveredHostsModel = function() {
            document.getElementById("openDiscoveredHosts").click();
        }

        $scope.acceptAllHosts = function() {
            _.each($scope.discoveredHosts, function(host: any) {
                if (host.state === "UNACCEPTED") {
                    $scope.acceptHost(host);
                }
            });
        };

        $interval($scope.reloadDiscoveredHosts, 5000);
        $interval($scope.reloadAlerts, 6000);
        $interval($scope.reloadTasks, 5000);
    }
}