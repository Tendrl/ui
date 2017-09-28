(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("userSettingController", userSettingController);

    /*@ngInject*/
    function userSettingController($rootScope, $scope, $state, $stateParams, userStore, Notifications, AuthManager) {

        var vm = this,
            user,
            currentUser,
            isDataLoading,
            typePassword,
            confirmPassword,
            currentState,
            errorMsg;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.isDataLoading = true;
        vm.typePassword = false;
        vm.confirmPassword = false;
        vm.toggleTypePassword = toggleTypePassword;
        vm.toggleConfirmPassword = toggleConfirmPassword;
        vm.currentState = $state.current.name;
        vm.currentUser = AuthManager.getUserRole();
        vm.errorMsg = "";

        init();

        function init() {
            userStore.getUserInfo()
                .then(function(data) {
                    vm.isDataLoading = false;
                    vm.user = data;
                });
        }

        vm.modalHeader = {
            "title": "My Settings",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "type": "button",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Save",
            "type": "button",
            "classname": "btn-primary",
            "onCall": vm.confirmModal
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf deleteUserController                

         */

        function cancelModal() {
            $state.go(vm.currentState);
            $rootScope.$emit("modal.done", "cancel");
        }

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf deleteUserController                

         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        /**
         * @name next
         * @desc takes to next step
         * @memberOf deleteUserController                

         */


        function confirmModal() {
            vm.formSubmitInProgress = true;
            if (_validateUIFields()) {
                vm.user.notification = vm.user.email_notifications;
                userStore.editUser(vm.user)
                    .then(function(data) {
                        vm.closeModal();
                        if (vm.currentState === "users") {
                            userStore.getUserList()
                                .then(function(data) {
                                    if (data !== null) {
                                        $rootScope.$broadcast("UpdatedUserList", data);
                                    }

                                });
                        }
                        Notifications.message("success", "", " Profile updated Successfully.");
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
                            }
                        } else {
                            vm.closeModal();
                            Notifications.message("danger", "", " Failed to update profile.");
                        }
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
                form = vm.userSettingForm;
            if (form.name.$invalid) {
                vm.errorMsg = "Please specify valid Name."
                isFormValid = false;
            } else if (!_isPasswordSame()) {
                vm.errorMsg = "Password and Confirm Password doesn't match.";
                isFormValid = false;
            } else if (form.password.$invalid) {
                vm.errorMsg = "Password should be 8 characters minimum";
                isFormValid = false;
            } else if (form.userEmail.$invalid) {
                vm.errorMsg = "Please enter Email id.";
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