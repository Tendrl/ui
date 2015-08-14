/// <reference path="../../../typings/tsd.d.ts" />

export class VolumeService {
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('api/v1/gluster');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('api/v1/gluster');
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **getList**
    // **@returns** a promise with all volumes.
    getList() {
        return this.rest.all('volumes').getList().then(function(volumes) {
            return volumes;
        });
    }

    // **getListByCluster
    // **@returns** a promise with all volumes of the cluster.
    getListByCluster(clusterId) {
        return this.rest.all('volumes').getList().then(function(volumes) {
            return _.filter(volumes, function(volume) {
                return volume.cluster === clusterId;
            });
        });
    }

    // **get**
    // **@returns** a promise with volume metadata.
    get(id) {
        return this.rest.one('volumes', id).get().then(function(volume) {
            return volume;
        });
    }

    // **get**
    // **@returns** a promise with list of bricks.
    getBricks(id) {
        return this.rest.one('volumes', id).all('bricks').getList().then(function(bricks) {
            return bricks;
        });
    }

    // **getCapacity**
    // **@returns** a promise with volume capacity in bytes.
    getCapacity(id) {
        return this.rest.one('volumes', id).one('utilization').get().then(function(capacity) {
            return { total: capacity.fs_size, free: capacity.fs_free, volumeId: id };
        });
    }

    // **create**
    // **@param** volume - Information about the volume and list of bricks.
    // **@returns** a promise which returns a request id to track the task.
    create(volume) {
        return this.restFull.all('volumes').post(volume);
    }

    // **create**
    // **@param** volume - Information about the volume and list of bricks.
    // **@returns** a promise which returns a request id to track the task.
    expand(volume) {
        return this.restFull.all('bricks').post(volume);
    }

    // **start**
    // **@param** id - Volume Identifier.
    // **@returns** a promise with status code.
    start(id) {
        return this.restFull.one('volumes', id).one('start').get();
    }
}
