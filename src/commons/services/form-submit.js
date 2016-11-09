(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("formSubmitService", formSubmitService);

    /*@ngInject*/
    function formSubmitService($http, constant) {

        /* Cache the reference to this pointer */
        var vm = this;
        
        vm.saveFormData = function(cluster_id, inventory, data) {
            var actionRequest = {
                method: "post",
                url: constant.getBaseURL() + 'cluster/' + cluster_id + '/' + inventory + '/create',
                data: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            };
            var request = angular.copy(actionRequest);
            return $http(request).then(function (response) {
                return response.data;
            });
        };
    }

})();
