//inject angularjs dependencies so that it can be used in react code.

export const ngDeps = {};

export function injectNgDeps(deps) {
    Object.assign(ngDeps, deps);
};

export default ngDeps;

var storageModule = angular.module("TendrlModule");

storageModule.run([
    "$rootScope",
    "$state",
    "$q",
    ($rootScope, $state, $q) => {
        injectNgDeps({ $rootScope, $state, $q });
    },
]);
