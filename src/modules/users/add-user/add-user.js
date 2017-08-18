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
    function addUserController($scope, $rootScope, $state, $stateParams, userStore, config, utils) {

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
                        vm.jobId = data.job_id;
                        $state.go("users");
                        $rootScope.notification.type = "error";
                        $rootScope.notification.message = "Please specify valid User Id.";
                    });
                $state.go("users");
                $rootScope.notification.type = "success";
                $rootScope.notification.message = "New User Added Succesfully.";

            } else {
                console.log("failed");
                vm.formSubmitInProgress = false;
            }
        }

        function _validateUIFields() {
            var isFormValid = true,
                form = vm.addUserForm;

            if (form.username.$invalid) {
                vm.errorMsg = "Please specify valid User Id.";
                isFormValid = false;
            } else if (form.firstName.$invalid) {
                vm.errorMsg = "Please specify valid First Name."
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