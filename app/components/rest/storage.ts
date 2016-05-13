/// <reference path="../../../typings/tsd.d.ts" />

export class StorageService {
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

    // **getFilteredList**
    // **@returns** a promise with all storages with query string.
    getFilteredList(queryString) {
        return this.rest.all('storages?' + queryString).getList().then(function(storages) {
            return storages;
        });
    }

    // **getList**
    // **@returns** a promise with all storages.
    getList() {
        return this.rest.all('storages').getList().then(function(storages) {
            return storages;
        });
    }

    // **getListByCluster**
    // **@returns** a promise  with all storages of the cluster.
    getListByCluster(clusterId) {
        return this.rest.one('clusters', clusterId).all('storages').getList().then(function(storages) {
            return storages;
        });
    }

    // **get**
    // **@returns** a promise with storage metadata.
    get(clusterId, storageId) {
        return this.rest.one('clusters', clusterId).one('storages', storageId).get().then(function(storage) {
            return storage;
        });
    }

    // **create**
    // **@param** storage - Information about the storage.
    // **@returns** a promise which returns a request id to track the task.
    create(clusterId, storage) {
        return this.restFull.one('clusters', clusterId).all('storages').post(storage);
    }

    // **create**
    // **@param** storageId - Information about the storage.
    // **@returns** a promise which returns a request id to track the task.
    delete(clusterId, storageId) {
        return this.restFull.one('clusters', clusterId).one('storages', storageId).remove();
    }

    update(clusterId, storageId, pool){
        return this.restFull.one('clusters', clusterId).one('storages', storageId).patch(pool);
    }
}
