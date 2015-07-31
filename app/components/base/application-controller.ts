/// <reference path="../../../typings/tsd.d.ts" />

export class ApplicationController {
    static $inject: Array<string> = ['$scope'];
    constructor($scope: any) {
        $scope.expandedView = true;
    }
}
