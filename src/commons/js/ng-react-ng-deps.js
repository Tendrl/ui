//inject angularjs dependencies so that it can be used in react code.

export const ngDeps = {};

export function injectNgDeps(deps) {
    Object.assign(ngDeps, deps);
    window.ngDeps = ngDeps;
};

export default ngDeps;

var storageModule = angular.module("TendrlModule");

storageModule.run([
    "$stateParams",
    "utils",
    "config",
    ($stateParams, utils, config) => {
        injectNgDeps({ $stateParams, utils, config });
    },
]);
