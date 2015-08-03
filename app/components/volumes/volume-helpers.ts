// <reference path="../typings/tsd.d.ts" />
/// <reference path="./volume-models" />

import {VolumeType, VolumeState, Tier, SizeUnit, DisperseOption} from './volume-models';

export class VolumeHelpers {
    private static volumeTypes: Array<VolumeType>;
    private static volumeStates: Array<VolumeState>;
    private static volumeCopiesList = [2, 3, 4];
    private static copyCountRecomended = 3;
    private static tierList: Array<Tier>;
    private static targetSizeUnits: Array<SizeUnit>;
    private static disperseOptions: Array<DisperseOption>;

    static init(){
        this.volumeTypes = [
            { id:1, type:'Distribute'},
            { id:2, type:'Distributed Replicate'},
            { id:3, type:'Replicate'}
        ];

        this.volumeStates = [
            { id:0, state:'Up'},
            { id:1, state:'Warning'},
            { id:2, state:'Down'},
            { id:3, state:'Unknown'},
            { id:4, state:'Created'}
        ];

        this.tierList = [
            { id:1, type:'Hot'}
        ];

        this.targetSizeUnits = [
            { id:1, unit: 'GB' },
            { id:2, unit: 'TB' }
        ];

        this.disperseOptions = [
            { id:1, type: 'RAID-6', desc: '8 + 2 (8 data disks + 2 parity disks)' },
            { id:2, type: 'RAID-6 (E)', desc: '8 + 3 (8 data disks + 3 parity disks)' }
        ];
    }
    
        public static getStorageDevicesForVolumeBasic(targetSize, copyCount, devicesList) {
        var selectedDevices = [];
        var size = 0;
        var iter = 0;
        while(size < targetSize) {
            var subVolSize = 0;
            _.each(_.range(copyCount), function(copyNo) {
                var device = devicesList[copyNo][iter];
                if(subVolSize === 0) {
                    device.repStart = true;
                }
                else {
                    device.repStart = false;
                }
                device.repSet = iter;
                subVolSize = device.size > subVolSize ? device.size : subVolSize;
                selectedDevices.push(device);
            });
            iter++;
            size = size + subVolSize;
        }
        return selectedDevices;
    };

    public static getVolumeSize(devices, copyCount) {
        var volumeSize = 0;
        for(var subVol=0; subVol<devices.length/copyCount; subVol++) {
            var subVolSize = 0;
            _.each(_.range(copyCount), function(copyNo){
                var device = devices[ subVol * copyCount + copyNo];
                subVolSize = device.size > subVolSize ? device.size : subVolSize;
            });
            volumeSize = volumeSize + subVolSize;
        }
        return volumeSize;
    };

    public static  getVolumeType(id: number): VolumeType {
        return _.find(this.volumeTypes, function(type) {
            return type.id === id;
        });
    }
    
    public static getVolumeState(id: number): VolumeState {
        return _.find(this.volumeStates, function(state) {
            return state.id === id;
        });
    }
    
    public static getCopiesList(): Array<number> {
        return this.volumeCopiesList;
    }

    public static getRecomendedCopyCount(): number {
        return this.copyCountRecomended;
    }

    public static getTierList(): Array<Tier> {
        return this.tierList;
    }

    public static getTargetSizeUnits(): Array<SizeUnit> {
        return this.targetSizeUnits;
    }

    public static getDisperseOptions(): Array<DisperseOption> {
        return this.disperseOptions;
    }
}

VolumeHelpers.init();
