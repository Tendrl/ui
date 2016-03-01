/// <reference path="../../../typings/tsd.d.ts" />

export class EventService {
    rest: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
    }

    // **getList**
    // **@returns** a promise with list of events.
    getList(pageNumber,pageSize,from,to) {
        return this.rest.one('events').get({
            pageno: pageNumber,
            pagesize: pageSize,
            fromdatetime:from,
            todatetime: to
        }).then(function(events) {
            return events;
        });
    }

    // **getList**
    // **@returns** a promise with list of events.
    getEvents() {
        return this.rest.one('events').get().then(function(events) {
            return events;
        });
    }

    // **get**
    // **@returns** a promise with the event.
    get(id) {
        return this.rest.one('events', id).get().then(function(event) {
            return event;
        });
    }
}
