/*
    ============= How to use "clusterFileShareList" directive ======
            
    - sample format:
    <cluster-file-share-list></cluster-file-share-list>

*/

(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.directive("clusterFileShareList", clusterFileShareList);

    /*@ngInject*/
    function clusterFileShareList() {

        return  {
                restrict : "E",
                controllerAs: "fileShareCntrl",
                bindToController: true,
                controller: "fileShareController",
                templateUrl: "/modules/file-share/file-share-list/file-share-list.html"
        }
    }

}());

