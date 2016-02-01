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
    // **@returns** a promise with list of tasks.
    getList() {
        return this.rest.all('tasks').getList().then(function(tasks) {
            return tasks;
        });
    }

    // **get**
    // **@returns** a promise with the task.
    get(id) {
        return this.rest.one('tasks', id).get().then(function(task) {
            return task;
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
    // **getSubTasks**
    // **@returns** a promise with list of subtasks.
    getSubTasks(id) {
        return this.rest.one('tasks', id).getList('subtasks').then(function(task) {
            return task;
        });
    }
}
