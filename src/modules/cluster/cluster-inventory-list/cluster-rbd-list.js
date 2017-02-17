/*
    ============= How to use "clusterRbdList" directive ======
            
    - sample format:
    <cluster-rbd-list></cluster-rbd-list>

*/

(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("clusterRbdList", clusterRbdList);

    /*@ngInject*/
    function clusterRbdList() {

        return  {
                restrict : "E",
                controllerAs: "rbdCntrl",
                bindToController: true,
                controller: "rbdController",
                templateUrl: "/modules/rbd/rbd-list/rbd-list.html"
        }
    }

}());

