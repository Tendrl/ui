/// <reference path="../../../../typings/tsd.d.ts" />

import {numeral} from '../../base/libs';

/*
 * @ngdoc filter
 * @name kitoon.shared:bytes
 *
 * This can be used like following
 *
 * {{ someexpresssion | bytes }}
*/

export function BytesFilter() {
    return function(bytes) {
        return numeral(bytes).format('0.0 b');
    };
}
