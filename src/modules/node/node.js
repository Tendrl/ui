(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("nodeController", nodeController);

    /*@ngInject*/
    function nodeController(utils, $state) {
        var vm = this;

        utils.getObjectList("Node").then(function(list) {
            vm.nodeList = list;
        }); 
    }

})();
