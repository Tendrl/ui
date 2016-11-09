(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("attributeListService", attributeListService);

    /*@ngInject*/
    function attributeListService($http, constant) {

        /* Cache the reference to this pointer */
        var vm = this;
        
        vm.getAttributeList = function(cluster_id, inventory) {
            var actionRequest = {
                method: "get",
                url: constant.getBaseURL() + 'cluster/' + cluster_id + '/' + inventory + '/attributes',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            };
            var request = angular.copy(actionRequest);
            return $http(request).then(function (response) {
                return response.data;
            });
        };
    }

})();

