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
    // **@returns** a promise with list of tasks.
    getList(pageNumber,pageSize) {
        return this.rest.one('events').get({
            pageNo: pageNumber,
            pageSize: pageSize
        }).then(function(tasks) {
            return tasks;
        });
    }

    // **get**
    // **@returns** a promise with the task.
    get(id) {
        return this.rest.one('events', id).get().then(function(task) {
            return task;
        });
    }
}
