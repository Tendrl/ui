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
    private ecprofiles = [{ k: 2, m: 1, text: '2+1', value: 'default' }, { k: 4, m: 2, text: '4+2', value: 'k4m2' }, { k: 6, m: 3, text: '6+3', value: 'k6m3' }, { k: 8, m: 4, text: '8+4', value: 'k8m4' }];
    private ecprofile = this.ecprofiles[0];
    private targetSize = 0;
    private profiles: StorageProfile[];
    private profile: StorageProfile;
    private pgs: number = 0;
    private PGsFixed = false;
    private pgSlider = {};
    private quota = { enabled: false, objects: { enabled: false, value: undefined }, percentage: { enabled: false, value: 75 } };
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
                this.targetSize = GetOptimalSizeForPGNum(this.pgs, this.slus, this.replicas);
            }
            else {
                this.preparePGSlider();
            }
        });
        this.storageProfileSvc.getList().then((profiles) => {
            this.profiles = profiles;
            this.profile = profiles[0];
        });
    }

    public preparePGSlider() {
        // An OSD can take upto 200 PGs. So the PGs for a pool can be between 128 and OSDs x 200
        var possiblePgs = GetTwosPowList(128, (this.slus.length * 200) / this.getReplicaCount());
        this.pgSlider = {
            value: 7, // 2^7 = 128. this is the min value for PGs
            options: {
                floor: 7,
                ceil: 7 + possiblePgs.length - 1,
                showTicks: true,
                showSelectionBar: true,
                translate: (value, sliderId, label) => {
                    var pgNum = Math.pow(2, value);
                    var size = GetOptimalSizeForPGNum(pgNum, this.slus, this.getReplicaCount());
                    var formatedSize = numeral(size).format('0.0 b');
                    switch (label) {
                        case 'model':
                            return '<b>' + pgNum + ' PGs / ' + formatedSize + '</b>';
                        default:
                            return pgNum + ' PGs / ' + formatedSize;
                    }
                },
                onChange: (sliderId, value, highValue) => {
                    var pgNum = Math.pow(2, value);
                    this.targetSize = GetOptimalSizeForPGNum(pgNum, this.slus, this.getReplicaCount());
                }
            }
        };
    }

    // Replica count is required for Placement Groups calculations
    // In case of EC pools, replica would be the sum of k and m
    public getReplicaCount() {
        if (this.type === 'Replicated') {
            return this.replicas;
        }
        else {
            return this.ecprofile.k + this.ecprofile.m;
        }
    }

    public replicaChanged() {
        this.preparePGSlider();
    }

    public ecProfileChanged() {
        this.preparePGSlider();
    }

    public changeStorageProfile(selectedProfile: StorageProfile) {
        this.clusterSvc.getSlus(this.cluster.clusterid).then(slus => {
            this.slus = slus;
            this.pgs = GetCephPGsForOSD(slus, 100, 3);
        });
    }

    public getQuotaPercentageSize(percent: string): string {
        var val = parseInt(percent) || 0;
        return numeral((val / 100) * this.targetSize).format('0.0 b');
    }

    public getQuotaTotalSize(): string {
        return numeral(this.targetSize).format('0.0 b');
    }

    public prepareSummary(): void {
        var pgNum = this.pgs;
        if (!this.PGsFixed) {
            pgNum = Math.pow(2, this.pgSlider['value']);
        }
        this.targetSize = GetOptimalSizeForPGNum(pgNum, this.slus, this.replicas);

        for (let index = 0; index < this.count; index++) {
            let pool = {
                name: this.name + index,
                type: this.type,
                profile: this.profile,
                replicas: this.replicas,
                ecprofile: this.ecprofile,
                capacity: this.targetSize,
                capacityFormated: numeral(this.targetSize).format('0b'),
                quota: this.quota
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
                size: pool.capacityFormated,
                options: {}
            };

            if (pool.type === 'Replicated') {
                storage['type'] = 'replicated';
                storage['replicas'] = pool.replicas;
            }
            else {
                storage['type'] = 'erasure_coded';
                storage.options['ecprofile'] = pool.ecprofile.value;
            }

            if (this.PGsFixed) {
                storage.options['pgnum'] = this.pgs.toString();
            }
            if (pool.quota.enabled) {
                storage['quota_enabled'] = true;
                storage['quota_params'] = {};
                if (pool.quota.objects.enabled) {
                    storage['quota_params'].quota_max_objects = pool.quota.objects.value.toString();
                }
                if (pool.quota.percentage.enabled) {
                    storage['quota_params'].quota_max_bytes = Math.round((pool.quota.percentage.value / 100) * pool.capacity).toString();
                }
            }

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
