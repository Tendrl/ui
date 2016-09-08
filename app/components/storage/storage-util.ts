// <reference path="../../../typings/tsd.d.ts" />

const TARGET_PGS_PER_OSD = 200;

/*
* Deriving PG from Target Size
*
* If 0-5 OSDs, PG = 128
* If 5-10 OSDs, PG = 512
* If 10-20 OSDs, PG = 1024
* If 20-30 OSDs, PG = 2048
* If 30-40 OSDs, PG = 3072
* If >50 OSDs, use calculations below
*
* PG = (Target_PGs_per_OSD * Total_no_of_OSDs * Percent_Data) / Replica
* where,
* Target_PGs_per_OSD = 200
* Total_no_of_OSDs =  Total number of OSDs in the cluster
* Percent_Data = User_Requested_Size / Max_Allocation_Size
*   Max_Allocation_Size = ((Avg_OSD_size * Total_no_of_OSDs) / Replica) * Max_Utilization_Factor
*   Max_Utilization_Factor = 0.8
* Replica = Requested by the user
*/

export function GetCephPGsForOSD(osds: Array<any>, targetAllocSize: number, replica: number) {
    if (osds.length <= 5) {
        return 128;
    }
    else if (osds.length <= 10) {
        return 512;
    }
    else if (osds.length <= 20) {
        return 1024;
    }
    else if (osds.length <= 30) {
        return 2048;
    }
    else if (osds.length <= 40) {
        return 3072;
    }
    else if (osds.length <= 50) {
        return 4096;
    }
    else {
        var avgOSDSize = getAvgOSDSize(osds);
        var maxAllocSize = ((avgOSDSize * osds.length) / replica) * 0.8;
        var percentData = targetAllocSize / maxAllocSize;
        var pgs = (TARGET_PGS_PER_OSD * osds.length * percentData) / replica;
        return nextTwosPow(pgs);
    }
}

function getAvgOSDSize(osds: Array<any>) {
    var totalsize = osds.reduce((size, osd) => {
        return size + osd.storagedevicesize;
    }, 0);
    return totalsize / osds.length;
}

function nextTwosPow(val: number) {
    var count = 0;
    var newValue = 0;
    while (newValue < val) {
        newValue = Math.pow(2, count);
        count++;
    }
    return newValue;
}

export function GetTwosPowList(min: number, max: number): number[] {
    var list = [];
    var val = 0;
    var count = 0;
    while (val < max) {
        var val = Math.pow(2, count)
        if (val >= min && val <= max) {
            list.push(val);
        }
        count++;
    }
    return list;
}

export function GetOptimalSizeForPGNum(pgs: number, osds: any[], replica: number): number {
    var avgOSDSize = getAvgOSDSize(osds);
    var maxAllocSize = ((avgOSDSize * osds.length) / replica) * 0.8;
    var targetAllocSize = ((pgs * replica) / (TARGET_PGS_PER_OSD * osds.length)) * maxAllocSize;
    return targetAllocSize;
}
