/// <reference path="../../../typings/tsd.d.ts" />

export class EventService {
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
    // **@returns** a promise with all events.
    getList() {
        return this.rest.all('events').getList().then(function(events) {
            return events;
        });
    }

    // **getListByCluster**
    // **@returns** a promise  with all events of the cluster.
    getListByCluster(clusterId) {
        return this.rest.one('clusters', clusterId).all('events').getList().then(function(events) {
            return events;
        });
    }

    // **get**
    // **@returns** a promise with event detaisl.
    get(eventId) {
        return this.rest.one('events', eventId).get().then(function(event) {
            return event;
        });
    }
}
