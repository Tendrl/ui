// <reference path="../../../typings/tsd.d.ts" />

import {Cluster} from '../../rest/clusters';
import {StorageProfile} from '../../rest/storage-profile';

import {ClusterService} from '../../rest/clusters';
import {StorageProfileService} from '../../rest/storage-profile';
import {StorageService} from '../../rest/storage';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {GetCephPGsForOSD} from '../storage-util';
import {GetTwosPowList} from '../storage-util';
import {GetOptimalSizeForPGNumList} from '../storage-util';
import {GetOptimalSizeForPGNum} from '../storage-util';
import {numeral} from '../../base/libs';

export class ObjectStorageController {
    private cluster: Cluster;
    private slus: any[];
    private name: string;
    private count: number = 1;
    private types = ['Replicated', 'Erasure Coded'];
    private type = 'Replicated';
    private replicas: number = 3;
    private targetSize = 0;
    private profiles: StorageProfile[];
    private profile: StorageProfile;
    private pgs: number = 0;
    private PGsFixed = false;
    private possiblePgs = [];
    private optimalSizeList = [];
    private pgSlider = {};
    private pools = [];

    static $inject: Array<string> = [
        '$routeParams',
        '$location',
        '$log',
        '$q',
        '$modal',
        'ClusterService',
        'StorageProfileService',
        'StorageService',
        'RequestTrackingService',
        'RequestService'
    ];
    constructor(private $routeParams: ng.route.IRouteParamsService,
        private $location: ng.ILocationService,
        private $log: ng.ILogService,
        private $q: ng.IQService,
        private $modal,
        private clusterSvc: ClusterService,
        private storageProfileSvc: StorageProfileService,
        private storageSvc: StorageService,
        private requestTrackingSvc: RequestTrackingService,
        private requestSvc: RequestService) {
        let clusterId = $routeParams['clusterid'];
        this.clusterSvc.get(clusterId).then(cluster => {
            this.cluster = cluster;
        });
        this.clusterSvc.getSlus(clusterId).then(slus => {
            this.slus = slus;

            this.PGsFixed = this.slus.length <= 50;
            if (this.PGsFixed) {
                this.pgs = GetCephPGsForOSD(this.slus, null, null);
            }
            else {
                this.possiblePgs = GetTwosPowList(128, this.slus.length * 200);
                this.optimalSizeList = GetOptimalSizeForPGNumList(this.possiblePgs, this.slus, this.replicas);
                this.preparePGSlider();
            }
        });
        this.storageProfileSvc.getList().then((profiles) => {
            this.profiles = profiles;
            this.profile = profiles[0];
        });

    }

    public preparePGSlider() {
        this.pgSlider = {
            value: 7,
            options: {
                floor: 7,
                ceil: 7 + this.possiblePgs.length - 1,
                showTicks: true,
                showSelectionBar: true,
                translate: (value, sliderId, label) => {
                    var pgNum = Math.pow(2, value);
                    var size = GetOptimalSizeForPGNum(pgNum, this.slus, this.replicas);
                    var formatedSize = numeral(size).format('0.0 b');
                    switch (label) {
                        case 'model':
                            return '<b>' + pgNum + ' PGs / ' + formatedSize + '</b>';
                        default:
                            return pgNum + ' PGs / ' + formatedSize;
                    }
                }
            }
        };
    }

    public changeStorageProfile(selectedProfile: StorageProfile) {
        this.clusterSvc.getSlus(this.cluster.clusterid).then(slus => {
            this.slus = slus;
            this.pgs = GetCephPGsForOSD(slus, 100, 3);
        });
    }

    public prepareSummary(): void {
        var pgNum = this.pgs;
        if (!this.PGsFixed) {
            pgNum = Math.pow(2, this.pgSlider['value']);
            this.targetSize = GetOptimalSizeForPGNum(pgNum, this.slus, this.replicas);
        }

        for (let index = 0; index < this.count; index++) {
            let pool = {
                name: this.name + index,
                type: this.type,
                profile: this.profile,
                replicas: this.replicas,
                capacity: numeral(this.targetSize).format('0.0b'),
            }
            this.pools.push(angular.copy(pool));
        }
    }

    public cancel(): void {
        this.$location.path('/storage');
    }

    public submit(): void {
        var list = [];
        for (let pool of this.pools) {
            let storage = {
                name: pool.name,
                type: 'replicated',
                replicas: pool.replicas,
                size: pool.capacity
            };
            list.push(this.storageSvc.create(this.cluster.clusterid, storage));
        }
        this.$q.all(list).then((tasks) => {
            for (var task of tasks) {
                this.requestSvc.get(task.data.taskid).then((result) => {
                    this.requestTrackingSvc.add(result.id, result.name);
                });
            }
        });
        var modal = ModalHelpers.SuccessfulRequest(this.$modal, {
            title: 'Add Object Storage Request is Submitted',
            container: '.usmClientApp'
        });
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
            $hide();
            this.$location.path('/storage');
        });
    }
}
