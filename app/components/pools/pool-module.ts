// <reference path="../typings/tsd.d.ts" />
declare function require(name: string);

import {PoolController} from './pools-controller';
import {PoolNewController} from './pool-new';

var angular: ng.IAngularStatic = require('angular');

var moduleName = 'usm-client.pools';

angular.module(moduleName, [])
    .controller('PoolController', PoolController)
    .controller('PoolNewController', PoolNewController);
    
export default moduleName;
