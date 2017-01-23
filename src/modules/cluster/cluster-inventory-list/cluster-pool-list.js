/*
    ============= How to use "clusterPoolList" directive ======
            
    - sample format:
    <cluster-pool-list></cluster-pool-list>

*/

(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("clusterPoolList", clusterPoolList);

    /*@ngInject*/
    function clusterPoolList() {

        return  {
                restrict : "E",
                controllerAs: "poolCntrl",
                bindToController: true,
                controller: "poolController",
                templateUrl: "/modules/pool/pool-list/pool-list.html"
        }
    }

}());

