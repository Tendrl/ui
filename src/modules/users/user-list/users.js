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
    function userController($scope, $rootScope, $state, $uibModal, $interval, utils, config, userStore, AuthManager, Notifications) {

        var vm = this,
            userTimer,
            userList,
            updatedNotification;


        vm.userList = [];
        vm.isDataLoading = true;
        vm.filterBy = "username";
        vm.filterByValue = "User ID";
        vm.filterPlaceholder = "User ID";

        vm.addNewUser = addNewUser;
        vm.editUserDetail = editUserDetail;
        vm.deleteUser = deleteUser;
        vm.toggleNotification = toggleNotification;
        vm.clearAllFilters = clearAllFilters;
        vm.changingFilterBy = changingFilterBy;

        init();

        function init() {
            userStore.getUserList()
                .then(function(data) {
                    vm.isDataLoading = false;
                    vm.userList = [];
                    if (data) {
                        vm.userList = data;
                    }
                }).catch(function(e) {
                    vm.isDataLoading = false;
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
                        return username;
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

        function toggleNotification(user) {
            var emailFlag;
            emailFlag = user.notification === true ? "disable" : "enable";
            userStore.editUser(user, "yes")
                .then(function(data) {
                    init();
                    Notifications.message("success", "", "Email notification is now " + emailFlag + "d for " + user.username + ".");
                }).catch(function(e) {
                    Notifications.message("danger", "", "Failed to " + emailFlag + " email notification for " + user.username + ".");
                });
        }

        function clearAllFilters() {
            vm.searchBy = {};
            vm.filterBy = "username";
        }

        function changingFilterBy(filterValue) {
            vm.filterBy = filterValue;
            switch (filterValue) {
                case "username":
                    vm.filterByValue = "User ID";
                    vm.filterPlaceholder = "User ID";
                    break;

                case "name":
                    vm.filterByValue = "Name";
                    vm.filterPlaceholder = "Name";
                    break;

                case "role":
                    vm.filterByValue = "Role";
                    vm.filterPlaceholder = "Role";
                    break;
            };
        }
    }

})();
