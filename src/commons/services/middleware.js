(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("middleware", middleware);

    /*@ngInject*/
    function middleware($rootScope, objectStructure) {

        /* Cache the reference to this pointer */
        var vm = this

        vm.structureParsor = function(response, objectName) {
            
        };

    }

})();