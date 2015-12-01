// <reference path="../../../typings/tsd.d.ts" />
declare function require(name: string);

import {EventListController} from './event-list';
import {angular} from '../base/libs';

var moduleName = 'kitoon.events';

angular.module(moduleName, [])
    .controller('EventListController', EventListController);

export default moduleName;
