/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name kitoon.dragdrop:ktDroppable
 * @scope
 * @restrict E
 *
 * @param {function} ktDroppable. The function which needs to be called when an item is dropped in to it.
 *
 * @description
 * An AngularJS directive for making an element acts a dropping target.
 *
 * @example
 * <div id='collection' kt-droppable="vm.itemDroppedIn(someCustomeData?, data)"></div>
 *
 * Here the 'data' will be replaced with whatever content is available with item being dropped.
*/

export class KTDroppable implements ng.IDirective {
    public restrict = 'A';
    public scope = {
        ktDroppable: '&ktDroppable'
    }
    constructor() {
    }

    public link($scope: ng.IScope, element: JQuery, attributes: ng.IAttributes) {
        var elem = element[0];
        elem.addEventListener('drop', (e) => {
            e.preventDefault();
            var data = e.dataTransfer.getData("Text");
            $scope['ktDroppable']({ data: JSON.parse(data) });
        }, false);
        // Event to drag over action on droppable element
        elem.addEventListener('dragover', function(e) {
            e.preventDefault();
        }, false);
        elem.addEventListener('dragenter', (e) => {
        }, false);
        elem.addEventListener('dragenter', (e) => {
        }, false);
    }
}
