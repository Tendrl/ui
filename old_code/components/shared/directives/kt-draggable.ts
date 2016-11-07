/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name kitoon.dragdrop:ktDraggable
 * @scope
 * @restrict E
 *
 * @param {object&} kTDraggable. The data which needs to be sent with the element being dragged
 *
 * @description
 * An AngularJS directive for making an element draggable.
 *
 * @example
 * <div id='item1' kt-draggable="item.id"></div>
*/

export class KTDraggable implements ng.IDirective {
    public restrict = 'A';
    public scope = {
        ktDraggable: '&ktDraggable'
    }
    constructor() {
    }

    public link($scope: ng.IScope, element: JQuery, attributes: ng.IAttributes) {
        var elem = element[0];
        elem.draggable = true;
        elem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('Text', JSON.stringify($scope['ktDraggable']()));
        }, false);
    }
}
