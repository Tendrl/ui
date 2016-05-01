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
 * for Cluster's osd detail
 * <osd-detail entity-id="clusterid" entity-type="Cluster"></osd-detail>
 *
 * for Host's osd detail
 * <osd-detail entity-id="hostid" entity-type="Host"></osd-detail>
 *
*/

import {OsdDetailController} from './osd-detail';

export class OsdDetail implements ng.IDirective {
    restrict: string = "E";
    scope = {
        id: '=entityId',
        type: '@entityType'
    };
    controllerAs: string = 'osddetail';
    bindToController: boolean = true;
    controller = OsdDetailController;
    templateUrl = 'views/clusters/osdsdetail/osd-detail.html';
}
