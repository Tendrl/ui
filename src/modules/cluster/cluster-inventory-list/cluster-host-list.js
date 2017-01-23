/*
    ============= How to use "clusterHostList" directive ======
            
    - sample format:
    <cluster-host-list></cluster-host-list>

*/

(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("clusterHostList", clusterHostList);

    /*@ngInject*/
    function clusterHostList() {

        return  {
                restrict : "E",
                controllerAs: "hostCntrl",
                bindToController: true,
                controller: "hostController",
                templateUrl: "/modules/host/host-list/host-list.html"
        }
    }

}());

