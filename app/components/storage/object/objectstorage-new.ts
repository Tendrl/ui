// <reference path="../../../typings/tsd.d.ts" />

import {Cluster} from '../../rest/clusters';
import {StorageProfile} from '../../rest/storage-profile';
import {SLU} from '../../rest/clusters';

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
    private slus: SLU[];
    private slusFiltered: SLU[];
    private name: string;
    private count: number = 1;
    private types = ['Standard'];
    private type = 'Standard';
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
    private summary: boolean = false;
    //variables that bind from objctstorage-new-directive
    private prepareRbdSummary: any;
    private poolName: string;
    private poolWithRbd: string;
    private rbdList: any[];

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
        if(this.poolWithRbd !== "true") {
            this.types.push('Erasure Coded');
        }
        let clusterId = $routeParams['clusterid'];
        this.clusterSvc.get(clusterId).then(cluster => {
            this.cluster = cluster;
        });
        this.clusterSvc.getSlus(clusterId).then((slus) => {
            this.slus = slus;
            return this.storageProfileSvc.getList();
        }).then((profiles) => {
            // Here the storage profiles which doesn't have any OSDs will be ignored
            var profilesWithOSDs = _.groupBy(this.slus, 'storageprofile');
            this.profiles = _.filter(profiles, profile => profilesWithOSDs[profile.name]);
            this.profile = this.profiles[0];
            this.filterOSDs(this.profile.name);
        });
    }

    public filterOSDs(storageprofile: string) {
        this.slusFiltered = _.filter(this.slus, (osd: SLU) => osd.storageprofile === storageprofile);
        this.PGsFixed = this.slusFiltered.length <= 50;
        if (this.PGsFixed) {
            this.pgs = GetCephPGsForOSD(this.slusFiltered, null, null);
            this.targetSize = GetOptimalSizeForPGNum(this.pgs, this.slusFiltered, this.replicas);
        }
        else {
            this.preparePGSlider();
        }
    }

    public preparePGSlider() {
        // An OSD can take upto 200 PGs. So the PGs for a pool can be between 128 and OSDs x 200 / replica
        var possiblePgs = GetTwosPowList(128, (this.slusFiltered.length * 200) / this.getReplicaCount());
        this.pgSlider = {
            value: 7, // 2^7 = 128. this is the min value for PGs
            options: {
                floor: 7,
                ceil: 7 + possiblePgs.length - 1,
                showTicks: true,
                showSelectionBar: true,
                translate: (value, sliderId, label) => {
                    var pgNum = Math.pow(2, value);
                    var size = GetOptimalSizeForPGNum(pgNum, this.slusFiltered, this.getReplicaCount());
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
                    this.targetSize = GetOptimalSizeForPGNum(pgNum, this.slusFiltered, this.getReplicaCount());
                }
            }
        };
        var pgNum = Math.pow(2, 7);
        this.targetSize = GetOptimalSizeForPGNum(pgNum, this.slusFiltered, this.getReplicaCount());
    }

    // Replica count is required for Placement Groups calculations
    // In case of EC pools, replica would be the sum of k and m
    public getReplicaCount() {
        if (this.type === 'Standard') {
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
        this.filterOSDs(selectedProfile.name);
    }

    public getQuotaPercentageSize(percent: string): number {
        var val = parseInt(percent) || 0;
        return (val / 100) * this.targetSize;
    }

    public getQuotaTotalSize(): number {
        return this.targetSize;
    }

    public prepareSummary(): void {
        var pgNum = this.pgs;
        if (!this.PGsFixed) {
            pgNum = Math.pow(2, this.pgSlider['value']);
        }
        this.targetSize = GetOptimalSizeForPGNum(pgNum, this.slusFiltered, this.replicas);
        if (this.count === 1) {
            let pool = {
                name: this.name,
                type: this.type,
                profile: this.profile,
                replicas: this.replicas,
                ecprofile: this.ecprofile,
                capacity: this.targetSize,
                quota: this.quota
            }
            this.pools.push(angular.copy(pool));
        } else {
            for (let index = 1; index <= this.count; index++) {
                let pool = {
                    name: this.name + index,
                    type: this.type,
                    profile: this.profile,
                    replicas: this.replicas,
                    ecprofile: this.ecprofile,
                    capacity: this.targetSize,
                    quota: this.quota
                }
                this.pools.push(angular.copy(pool));
            }
        }
        this.summary = true;
        if (this.poolWithRbd === "true") {
            this.poolName = this.name;
            this.prepareRbdSummary();
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
                profile: pool.profile.name,
                size: numeral(pool.capacity).format('0b'),
                options: {}
            };

            if (pool.type === 'Standard') {
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
            if (this.poolWithRbd === "true") {
                 var rbdArray = _.map(this.rbdList, (rbd) => { return {name: rbd.name, size: rbd.size.value + rbd.size.unit}});
                 storage['blockdevices'] = rbdArray;
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
