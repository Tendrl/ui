/// <reference path="../../../../typings/tsd.d.ts" />
declare function require(name: string);

/*
 * @ngdoc directive
 * @name kitoon.pf-donut-pct-chart-fixed: PfDonutPctChartFixed
 * @scope
 * @restrict A
 *
 * @description
 * An AngularJS directive for updating donut chart arc.
 *
 * @example
 * <div pf-donut-pct-chart-fixed>
 *      <div pf-donut-pct-chart config="usedConfig" data="usedData" center-
 *       label="usedLabel">
 *      </div>
 * </div>
 *
*/

var jquery = $ = require("jquery");

export class PfDonutPctChartFixed implements ng.IDirective {
    public restrict = 'A';
    public transclude = true;
    public template = '<div ng-transclude></div>';
    constructor(private $timeout: ng.ITimeoutService) {}
    public link:ng.IDirectiveLinkFn = (scope:ng.IScope, element: JQuery) => {
      this.$timeout(function () {
            var pfDonutPctChart = element.find('span')[0];
            var innerScope: any = angular.element(pfDonutPctChart).isolateScope();
            innerScope.updateAll = function (scope) {
              scope.updateAvailable();
              scope.config.data = jquery.extend( scope.config.data, scope.getDonutData(scope));
              scope.config.color = scope.statusDonutColor(scope);
              scope.config.data.onclick = scope.config.onClickFn;
            };
      },200);
    };
}

