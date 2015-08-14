/// <reference path="../../../typings/tsd.d.ts" />

export class RequestService {
    // **Constant variable** constant variable for *pageSize*.
    pageSize = 32;
    rest: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
    }

    // **getList**
    // **@returns** a promise with most recent *pageSize* requests.
    getList() {
        /* jshint camelcase: false */
        return this.rest.customGETLIST('tasks', {
            page_size: this.pageSize
        }).then(function(requests) {
            return requests;
        });
    }

    // **get**
    // **@returns** a promise with a single request by it's ID.
    get(id) {
        return this.rest.one('tasks', id).customGET('status').then(function(resp) {
            return resp.task;
        });
    }

    // **getComplete**
    // **@returns** a promise with most recent *pageSize* completed requests.
    getComplete() {
        /* jshint camelcase: false */
        return this.rest.customGETLIST('tasks', {
            state: 'complete',
            page_size: this.pageSize
        });
    }

    // **getSubmitted**
    // **@returns** a promise with most recent *pageSize* submitted requests.
    getSubmitted() {
        /* jshint camelcase: false */
        return this.rest.customGETLIST('tasks', {
            state: 'submitted',
            page_size: this.pageSize
        });
    }
}
