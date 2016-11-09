/// <reference path="../../../typings/tsd.d.ts" />

export class EventService {
    rest: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest;
    }

    // **getList**
    // **@returns** a promise with list of events.
    getList(requestObject) {
        return this.rest.one('events').get(requestObject).then(function(events) {
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

    // **dismiss**
    // **@returns** a status with the dismiss event.
    dismiss(id, comment) {
        comment = "Dismissed: "+comment;
        return this.rest.one('events', id).patch({
                "acked": true,
                "ackcomment": comment
        }).then(function(status) {
        return status;
    });
}
}
