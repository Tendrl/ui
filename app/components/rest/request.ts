/// <reference path="../../../typings/tsd.d.ts" />

export class RequestService {
    rest: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
    }

    // **getList**
    // **@returns** a promise with list of tasks.
    getList(pageNumber, pageSize, taskStatus, from, to, searchMessage) {
        return this.rest.one('tasks').get({
            level: 'root',
            pageno: pageNumber,
            pagesize: pageSize,
            state: taskStatus,
            fromdatetime: from,
            todatetime: to,
            searchmessage: searchMessage
        }).then(function(tasks) {
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

    // **getSubTasks**
    // **@returns** a promise with list of subtasks.
    getSubTasks(id) {
        return this.rest.one('tasks', id).getList('subtasks').then(function(task) {
            return task;
        });
    }
}
