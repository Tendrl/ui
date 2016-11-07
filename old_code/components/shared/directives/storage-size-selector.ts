/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name kitoon.common:StorageSizeSelector
 * @scope
 * @restrict EA
 *
 * @param {object} default. The object which holds the default value in the form of {value: , unit: }
 * @param {function} on-change. The function which needs to be called when the size is changed.
 *
 * @description
 * An AngularJS directive for size componenet which includes a size number input and a unit dropdown.
 *
 * @example
 * <storage-size-selector default="defaultVaue" on-change="updateSize(newSize)"></storage-size-selector>
 *
*/

export class StorageSizeSelector implements ng.IDirective {
    restrict = 'E';
    scope = {
        initialSize: '=default',
        onChange: '&'
    };
    bindToController = true;
    controller = function() {
        this.units = ['GB', 'TB', 'PB'];
        if (this.initialSize) {
            this.value = this.initialSize.value;
            this.unit = this.initialSize.unit;
        }
        else {
            this.value = 1;
            this.unit = 'GB';
        }
        this.update = function() {
            this.onChange({ newSize: { value: this.value, unit: this.unit } });
        }
    };
    controllerAs = 'size';
    templateUrl = 'views/shared/directives/storage-size-selector.html';
}
