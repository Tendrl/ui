(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("editUser", {

            restrict: "E",
            templateUrl: "/modules/users/edit-user/edit-user.html",
            bindings: {},
            controller: editUserController,
            controllerAs: "editUserCntrl"
        });

    /*@ngInject*/
    function editUserController($rootScope, $scope, $interval, $state, $stateParams, userStore, config, utils) {

    	var vm = this;
    }

})();