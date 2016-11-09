(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("constant", constant);

    /*@ngInject*/
    function constant() {

        /* Cache the reference to this pointer */
        var vm = this;

        vm.BASE_URL = "http://localhost:9393/1.0/";
        //vm.BASE_URL = "http://10.70.41.164:9292/1.0/";

        vm.getBaseURL = function() {
            return vm.BASE_URL;
        };
    }

})();
