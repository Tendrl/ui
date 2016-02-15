// <reference path="../typings/tsd.d.ts" />

import {StorageProfile} from '../../rest/storage-profile';

import {ServerService} from '../../rest/server';
import {StorageProfileService} from '../../rest/storage-profile';
import {numeral} from '../../base/libs';

export class StorageProfileDisksController {
    private storageProfiles: StorageProfile[];
    private selectedProfile: StorageProfile;
    private add = false;
    private storageProfileDisks: {};
    private storageDisks: any[];
    private addingProfile = false;
    static $inject: Array<string> = [
        '$q',
        'ServerService',
        'StorageProfileService'
    ];
    public constructor(
        private $q: ng.IQService,
        private serverSvc: ServerService,
        private storageProfileSvc: StorageProfileService) {
        this.loadData();
    }

    public loadData() {
        this.storageProfileDisks = {};
        this.storageProfileSvc.getList().then((list) => {
            this.storageProfiles = list;
            this.selectedProfile = this.storageProfiles[0];
            for (var storageProfile of this.storageProfiles) {
                this.storageProfileDisks[storageProfile.name] = [];
            }
            return this.serverSvc.getList();
        }).then((nodes) => {
            for (var node of nodes) {
                for (var disk of node.storage_disks) {
                    disk.nodeid = node.nodeid;
                    disk.hostname = node.hostname;
                }
            }
            var disks = _.reduce(nodes, function(arr: any[], node) {
                return arr.concat(node.storage_disks);
            }, []);
            this.storageDisks = disks;
            for (var storageDisk of this.storageDisks) {
                if (storageDisk.Type === 'disk' && storageDisk.StorageProfile && storageDisk.StorageProfile.length > 0) {
                    this.storageProfileDisks[storageDisk.StorageProfile].push(storageDisk);
                }
            }
        });
    }

    public selectStorageProfile(selectedProfile: StorageProfile) {
        this.selectedProfile = selectedProfile;
    }

    public getDisksForStorageProfile(storageProfile: StorageProfile): any[] {
        return this.storageProfileDisks[storageProfile.name];
    }

    public getStorageProfileSize(storageProfile: StorageProfile): string {
        var size = _.reduce(this.storageProfileDisks[storageProfile.name], function(size, disk: any) {
            return size + disk.Size;
        }, 0)
        return numeral(size).format('0.0 b');;
    }

    public getDiskSize(disk): string {
        return numeral(disk.Size).format('0.0 b');
    }

    public diskMoved(storageProfile: StorageProfile, disk) {
        console.log(disk);
        var prevProfile = disk['StorageProfile'];
        disk['StorageProfile'] = storageProfile.name;
        _.remove(this.storageProfileDisks[prevProfile], function(d) {
            return disk.nodeid === d.nodeid && disk.DevName === d.DevName;
        });
        this.storageProfileDisks[storageProfile.name].push(disk);
    }

    public addProfile(profileName: string) {
        this.storageProfileSvc.add({ name: profileName }).then((result) => {
            if (result.status === 200) {
                this.add = false;
                return this.storageProfileSvc.getByName(profileName);
            }
        }).then((storageProfile: StorageProfile) => {
            this.storageProfiles.push(storageProfile);
            this.storageProfileDisks[profileName] = [];
        });
    }

    public submit() {
        var requests = [];
        for (var storageProfile of this.storageProfiles) {
            var disks = this.storageProfileDisks[storageProfile.name];
            for (var disk of disks) {
                requests.push(this.serverSvc.updateDiskStorageProfile(disk.nodeid, disk.DiskId, disk.StorageProfile));
            }
        }
        this.$q.all(requests).then((results) => {
            console.log(results);
        });
    }
}
