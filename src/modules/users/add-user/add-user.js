(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("addUser", {

            restrict: "E",
            templateUrl: "/modules/users/add-user/add-user.html",
            bindings: {},
            controller: addUserController,
            controllerAs: "addUserCntrl"
        });

    /*@ngInject*/
    function addUserController($scope, $rootScope, $state, userStore, config, utils, Notifications) {

        var vm = this,
            typePassword,
            confirmPassword;

        vm.typePassword = false;
        vm.confirmPassword = false;
        vm.errorMsg = "";
        vm.user = {};
        vm.user.notification = true;
        vm.user.role = "admin";
        vm.toggleTypePassword = toggleTypePassword;
        vm.toggleConfirmPassword = toggleConfirmPassword;
        vm.addUser = addUser;

        function addUser() {
            var data;
            vm.formSubmitInProgress = true;

            if (_validateUIFields()) {

                userStore.createUser(vm.user)
                    .then(function(data) {
                        Notifications.message("success", "", "New User Added Successfully.");
                        $state.go("users");
                    }).catch(function(e) {
                        var keys,
                            messages;

                        if (e.status === 422) {
                            keys = Object.keys(e.data.errors);
                            messages = Object.values(e.data.errors)[0];
                            if (((keys.indexOf("email") !== -1) && (messages.indexOf("is taken") !== -1)) && (keys.indexOf("username") !== -1)) {
                                vm.errorMsg = "Email and User Id are already taken. Please use different one.";
                            } else if (keys.indexOf("email") !== -1) {
                                if (messages.indexOf("is taken") !== -1) {
                                    vm.errorMsg = "Email is already taken. Please use different one.";
                                } else if (messages.indexOf("is invalid") !== -1) {
                                    vm.errorMsg = "Please enter a valid Email Id";
                                }
                            } else if (keys.indexOf("username") !== -1) {
                                vm.errorMsg = "Username is already taken. Please use different one.";
                            } else if (keys.indexOf("name") !== -1) {
                                vm.errorMsg = "Name is too short (minimum is 4 characters).";
                            } else {
                                vm.errorMsg = "Someting went wrong. Please try again.";
                            }
                        } else {
                            vm.errorMsg = "Failed to create user.";
                        }

                    })
                    .finally(function() {
                        vm.formSubmitInProgress = false;
                    });
            } else {
                vm.formSubmitInProgress = false;
            }
        }

        function _validateUIFields() {
            var isFormValid = true,
                form = vm.addUserForm;

            if (form.name.$invalid) {
                vm.errorMsg = "Please specify valid Name.";
                isFormValid = false;
            } else if (form.username.$dirty && form.username.$error.maxlength) {
                vm.errorMsg = "User ID can contain maximum 20 characters."
                isFormValid = false;
            } else if (form.username.$invalid) {
                vm.errorMsg = "Please specify valid User Id.";
                isFormValid = false;
            } else if ((form.confirmPassword.$dirty && form.confirmPassword.$error.maxlength) ||
                (form.password.$dirty && form.password.$error.maxlength)) {
                vm.errorMsg = "Password can contain maximum 128 characters."
                isFormValid = false;
            } else if (form.password.$invalid || form.confirmPassword.$invalid) {
                vm.errorMsg = "Please specify valid Password."
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

        function toggleTypePassword() {
            vm.typePassword = !vm.typePassword;
        }

        function toggleConfirmPassword() {
            vm.confirmPassword = !vm.confirmPassword;
        }

    }
})();
