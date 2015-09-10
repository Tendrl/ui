/// <reference path="../../../typings/tsd.d.ts" />

import {VolumeService} from '../rest/volume';
import {ClusterService} from '../rest/clusters';
import {MockDataProvider} from '../clusters/mock-data-provider-helpers';
import {VolumeHelpers} from './volume-helpers';

declare var require : any;
var numeral = require("numeral");

export class VolumeController {
    private list: Array<any>;
    private first = true;
    private capacityMap = {};
    private mockDataProvider: MockDataProvider = new MockDataProvider();
    static $inject: Array<string> = [
        '$scope',
        '$q',
        '$interval',
        '$location',
        'ClusterService',
        'VolumeService'
    ];
    constructor(
        private $scope: ng.IScope,
        private $q: ng.IQService,
        private $interval: ng.ITimeoutService,
        private $location: ng.ILocationService,
        private clusterSvc: ClusterService,
        private volumeSvc: VolumeService) {

        clusterSvc.getList().then(function(clusters) {
            if (clusters.length === 0) {
                $location.path('/first');
            }
        });

        var timer1 = $interval(() => this.reloadData, 10000);
        var timer2 = $interval(() => this.reloadCapacity, 60000);
        $scope.$on('$destroy', function() {
            $interval.cancel(timer1);
            $interval.cancel(timer2);
        });
        this.reloadData();
    }

    private reloadData(): void {
        var self = this;
        this.volumeSvc.getList().then(function(volumes) {
            _.each(volumes, function(volume) {
                var mockVolume = self.mockDataProvider.getMockVolume(volume.volume_name);
                volume.areaSpline_cols = [{ id: 1, name: 'Used', color: '#39a5dc', type: 'area-spline' }];
                volume.areaSpline_values = mockVolume.areaSplineValues;
                volume.alerts = mockVolume.alerts;
                self.volumeSvc.getBricks(volume.volume_id).then(function(bricks) {
                    volume.bricks = bricks.length;
                });
                if (volume.cluster != null) {
                    self.clusterSvc.get(volume.cluster).then(function(cluster) {
                        volume.cluster_type = cluster.cluster_type;
                    });
                }
            });
            self.list = volumes;
            if (self.first) {
                self.reloadCapacity();
            }
            else {
                self.updateCapacity();
            }
            self.first = false;
        });
    }

    private reloadCapacity() {
        var self = this;
        var volumes = this.list.slice(0);
        if (volumes.length === 0) {
            return;
        }

        var updateCapacity = function(capacity) {
            capacity.freeFormatted = self.formatSize(capacity.free);
            capacity.totalFormatted = self.formatSize(capacity.total);
            var percent_used = (100 - (((capacity.free / 1073741824) * 100) / (capacity.total / 1073741824)));
            capacity.percent_used = isNaN(percent_used) ? 0 : percent_used;
            self.capacityMap[capacity.volumeId] = capacity;
        };

        var findCapacity = function(volumes, volume) {
            self.volumeSvc.getCapacity(volume.volume_id).then(function(capacity) {
                updateCapacity(capacity);
                if (volumes.length > 0) {
                    var nextVolume = volumes[0];
                    findCapacity(_.rest(volumes), nextVolume);
                }
                else {
                    self.updateCapacity();
                }

            });
        };
        var volume = volumes[0];
        findCapacity(_.rest(volumes), volume);
    }

    private updateCapacity() {
        var self = this;
        _.each(self.list, function(volume: any) {
            volume.capacity = self.capacityMap[volume.volume_id];
        });
    }

    private formatSize(size) {
        return numeral(size ? size : 0).format('0.0 b');
    };

    private getVolumeType(id) {
        return VolumeHelpers.getVolumeType(id).type;
    };

    private getVolumeState(id) {
        return VolumeHelpers.getVolumeState(id).state;
    };

    private create() {
        this.$location.path('/volumes/new');
    };

    private expand(volume_id) {
        this.$location.path('/volumes/expand/' + volume_id);
    };

    private isDeleteAvailable() {
        return false;
    };

    private remove(volume_id) {
        //this.volumeSvc.delete(volume_id);
    };
}
