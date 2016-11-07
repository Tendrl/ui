// <reference path="../../../typings/tsd.d.ts" />

/**
 * @ngdoc directive
 * @name kitoon.tasks.taskDetail
 * @scope
 * $restrict E
 *
 * @description
 * An AngularJS Directive for showing details of Task
 *
 * @example
 * <task-detail task-id="tasks.taskId"></task-detail>
 */

import {TaskDetailController} from "./task-detail-controller";

export class TaskDetail implements ng.IDirective {
    restrict = 'E';
    scope = {
        taskId: '=taskId'
    };
    controller = TaskDetailController;
    controllerAs = 'task';
    bindToController = true;
    templateUrl = 'views/tasks/task-details.html';
}