(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("users", {

            restrict: "E",
            templateUrl: "/modules/users/user-list/users.html",
            bindings: {},
            controller: userController,
            controllerAs: "userCntrl"
        });

    /*@ngInject*/
    function userController($scope, $rootScope, $state, $interval, utils, config, userStore) {

        var vm = this,
            userTimer,
            userList;


        vm.userList = [];
        vm.isDataLoading = true;
        vm.addNewUser = addNewUser;
        vm.editUserDetail = editUserDetail;

        init();

        function init() {
            userStore.getUserList()
                .then(function(data) {
                    vm.isDataLoading = false;
                    vm.userList = [];
                    if (data !== null) {
                        vm.userList = data;
                    }

                });
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(userTimer);
        });

        function addNewUser() {
            $state.go("add-user");
        }

        function editUserDetail(username) {
            $state.go("edit-user", { userId: username });
        }
    }

})();