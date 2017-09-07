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
    function userController($scope, $rootScope, $state, $uibModal, $interval, utils, config, userStore, AuthManager) {

        var vm = this,
            userTimer,
            userList,
            currentUser;


        vm.userList = [];
        vm.isDataLoading = true;
        vm.addNewUser = addNewUser;
        vm.editUserDetail = editUserDetail;
        vm.deleteUser = deleteUser;
        vm.currentUser = AuthManager.getUserInfo().username;

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

        $scope.$on("UpdatedUserList", function(event, data) {
            if (data !== null) {
                vm.userList = data;
            }
        });

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

        function deleteUser(username) {
            var wizardDoneListener,
                modalInstance,
                closeWizard;

            modalInstance = $uibModal.open({
                animation: true,
                backdrop: "static",
                templateUrl: "/modules/users/delete-user/delete-user.html",
                controller: "deleteUserController",
                controllerAs: "vm",
                size: "md",
                resolve: {
                    selectedUser: function() {
                        return {
                            username: username,
                            userList: vm.userList
                        };
                    }
                }
            });

            closeWizard = function(e, reason) {
                modalInstance.dismiss(reason);
                wizardDoneListener();
            };

            modalInstance.result.then(function() {}, function() {});
            wizardDoneListener = $rootScope.$on("modal.done", closeWizard);
        }
    }

})();