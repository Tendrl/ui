/// <reference path="../../../typings/tsd.d.ts" />

export interface BlockDevice {
    name: string,
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

    // **Add**
    // **@returns** add a new block device
    add(clusterId: string, storageId: string, blockdevice: BlockDevice) {
        return this.restFull.one('clusters', clusterId).one('storages', storageId).all('blockdevices').post(blockdevice);
    }
}
