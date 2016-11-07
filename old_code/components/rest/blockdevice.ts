/// <reference path="../../../typings/tsd.d.ts" />

export interface BlockDevice {
    id?: string,
    name: string,
    clusterid?: string,
    clustername?: string,
    storageid?: string,
    storagename?: string,
    tags?: string[],
    size: string,
    options?: {}
}

export class BlockDeviceService {
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **getList**
    // **@returns** a promise with all Block devices.
    getList() {
        return this.rest.all('blockdevices').getList<BlockDevice>().then(function(blockdevices: Array<BlockDevice>) {
            return blockdevices;
        });
    }

    // **getListByCluster**
    // **@returns** a promise with all Block devices for the given cluster.
    getListByCluster(clusterid: string) {
        return this.rest.one('clusters', clusterid).all('blockdevices').getList<BlockDevice>().then(function(blockdevices: Array<BlockDevice>) {
            return blockdevices;
        });
    }

    // **Add**
    // **@returns** add a new block device
    add(clusterId: string, storageId: string, blockdevice: BlockDevice) {
        return this.restFull.one('clusters', clusterId).one('storages', storageId).all('blockdevices').post(blockdevice);
    }

    // **Resize**
    // **@param** blockDeviceId - id of block device to be resized
    // **@returns** a promise with the request id for the operation.
    resize(clusterId: string, storageId: string, blockDeviceId: string, size: { size: string }) {
        return this.restFull.one('clusters', clusterId).one('storages', storageId).one('blockdevices', blockDeviceId).patch(size);
    }

    // **Remove**
    // **@param** id - id of block device to be removed
    // This is a **destructive** operation and will remove
    // any data on this block device.
    // **@returns** a promise with the request id for the operation.
    remove(clusterId: string, storageId: string, blockDeviceId: string) {
        return this.restFull.one('clusters', clusterId).one('storages', storageId).one('blockdevices', blockDeviceId).remove();
    }
}
