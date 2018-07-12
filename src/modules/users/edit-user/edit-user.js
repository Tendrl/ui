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
    function editUserController($rootScope, $scope, $interval, $state, $stateParams, userStore, config, utils, Notifications) {

        var vm = this,
            userDetail;

        vm.typePassword = false;
        vm.confirmPassword = false;
        vm.userDetail = [];
        vm.isDataLoading = true;
        vm.user = {};
        vm.errorMsg = "";
        vm.username = $stateParams.userId;
        vm.toggleTypePassword = toggleTypePassword;
        vm.toggleConfirmPassword = toggleConfirmPassword;
        vm.editUser = editUser;

        init();

        function init() {
            if (!userStore.users.length) {
                userStore.getUserList()
                    .then(function(data) {
                        vm.isDataLoading = false;
                        vm.user = userStore.getUserDetail(vm.username);
                    });
            } else {
                vm.isDataLoading = false;
                vm.user = userStore.getUserDetail(vm.username);
            }
        }

        function editUser() {
            vm.formSubmitInProgress = true;
            if (_validateUIFields()) {
                userStore.editUser(vm.user)
                    .then(function(data) {
                        Notifications.message("success", "", "User Successfully Updated.");
                        $state.go("users");
                    }).catch(function(e) {
                        var keys,
                            messages;

                        if (e.status === 422) {
                            keys = Object.keys(e.data.errors);
                            messages = Object.values(e.data.errors)[0];
                            if (keys.indexOf("email") !== -1) {
                                if (messages.indexOf("is taken") !== -1) {
                                    vm.errorMsg = "Email is already taken. Please use different one.";
                                } else if (messages.indexOf("is invalid") !== -1) {
                                    vm.errorMsg = "Please enter a valid Email Id";
                                }
                            } else if (keys.indexOf("name") !== -1) {
                                vm.errorMsg = "Name is too short (minimum is 4 characters).";
                            } else {
                                vm.errorMsg = "Someting went wrong. Please try again.";
                            }
                        } else {
                            Notifications.message("danger", "", "Failed to update user.");
                            $state.go("users");
                        }
                    })
                    .finally(function() {
                        vm.formSubmitInProgress = false;
                    });
            } else {
                vm.formSubmitInProgress = false;
            }
        }

        function toggleTypePassword() {
            vm.typePassword = !vm.typePassword;
        }

        function toggleConfirmPassword() {
            vm.confirmPassword = !vm.confirmPassword;
        }


        /***Private Functions***/

        function _validateUIFields() {
            var isFormValid = true,
                form = vm.editUserForm;

            if (form.name.$invalid) {
                vm.errorMsg = "Please specify valid Name."
                isFormValid = false;
            } else if((form.confirmPassword.$dirty && form.confirmPassword.$error.maxlength) || 
                (form.password.$dirty && form.password.$error.maxlength) ) {
                vm.errorMsg = "Password can contain maximum 128 characters."
                isFormValid = false;
            } else if (!_isPasswordSame()) {
                vm.errorMsg = "Password and Confirm Password doesn't match.";
                isFormValid = false;
            }

            return isFormValid;
        }

        function _isPasswordSame() {
            if (vm.user.password == vm.user.confirmPassword) {
                return true;
            } else {
                return false;
            }
        }
    }

})();