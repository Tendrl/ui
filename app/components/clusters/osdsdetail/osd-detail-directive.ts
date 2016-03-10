/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name cluster:osdDetail
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the details of osds in cluster.
 *
 * @example
 * <osd-detail clusterId="clusterid"></osd-detail>
 *
*/

import {OsdDetailController} from './osd-detail';

export class OsdDetail implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=clusterId'
    };
    controllerAs: string = 'osddetail';
    bindToController: boolean = true;
    controller = OsdDetailController;
    templateUrl = 'views/clusters/osdsdetail/osd-detail.html';
}
