// <reference path="../typings/tsd.d.ts" />

export interface VolumeType {
    id: number;
    type: string;
}

export interface VolumeState {
    id: number;
    state: string;
}

export interface Tier {
    id: number;
    type: string;
}

export interface SizeUnit {
    id: number;
    unit: string;
}

export interface DisperseOption {
    id: number;
    type: string;
    desc: string;
}
