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
    function addUserController($scope, $rootScope, $state, $stateParams, userStore, config, utils, Notifications) {

        var vm = this,
            typePassword,
            confirmPassword,
            emailNotificationValue;

        vm.typePassword = false;
        vm.confirmPassword = false;
        vm.errorMsg = "";
        vm.user = {};
        vm.user.emailNotification = true;
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
                        Notifications.message("success", "", "New User Added Succesfully.");
                        $state.go("users");
                    }).catch(function(e) {
                        var keys;

                        if (e.status === 422) {
                            keys = Object.keys(e.data.errors);
                            if ((keys.indexOf("email") !== -1) && (keys.indexOf("username") !== -1)) {
                                vm.errorMsg = "Email and User Id are already taken. Please use different one.";
                            } else if (keys.indexOf("email") !== -1) {
                                vm.errorMsg = "Email is already taken. Please use different one.";
                            } else if (keys.indexOf("username") !== -1) {
                                vm.errorMsg = "Username is already taken. Please use different one.";
                            }
                        } else {
                            vm.errorMsg = "Failed to create user.";
                        }

                    });
            } else {
                vm.formSubmitInProgress = false;
            }
        }

        function _validateUIFields() {
            var isFormValid = true,
                form = vm.addUserForm;

            if (form.username.$invalid) {
                vm.errorMsg = "Please specify valid User Id.";
                isFormValid = false;
            } else if (form.name.$invalid) {
                vm.errorMsg = "Please specify valid Name."
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