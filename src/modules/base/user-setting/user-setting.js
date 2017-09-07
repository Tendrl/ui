(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("userSettingController", userSettingController);

    /*@ngInject*/
    function userSettingController($rootScope, $scope, $state, userStore, loggedUser, Notifications) {

        var vm = this;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.isDataLoading = true;

        function init() {
            if (!userStore.users.length) {
                userStore.getUserList()
                    .then(function(data) {
                        vm.isDataLoading = false;
                        vm.user = userStore.getUserDetail(vm.username);
                        vm.user.emailNotification = vm.user.notification === "enabled" ? true : false;
                        vm.user.status = vm.user.status === "enabled" ? true : false;
                    });
            } else {
                vm.isDataLoading = false;
                vm.user = userStore.getUserDetail(vm.username);
                vm.user.emailNotification = vm.user.notification === "enabled" ? true : false;
                vm.user.status = vm.user.status === "enabled" ? true : false;
            }
        }

        vm.modalHeader = {
            "title": "My Settings",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Save",
            "classname": "btn-primary",
            "onCall": vm.confirmModal
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf StopVolumeController
         */

        function cancelModal() {
            $rootScope.$emit("modal.done", "cancel");
        }

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf StopVolumeController
         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        /**
         * @name next
         * @desc takes to next step
         * @memberOf StopVolumeController
         */
        function confirmModal() {
            userStore.doActionOnUser(loggedUser.username)
                .then(function(data) {
                    vm.closeModal();
                    userStore.getUserList()
                        .then(function(data) {
                            if (data !== null) {
                                selectedUser.userList = data;
                            }
                            $rootScope.$broadcast("UpdatedUserList", selectedUser.userList);
                            Notifications.message("success", "", selectedUser.username + " deleted Succesfully.");
                        });

                }).catch(function(e) {
                    vm.closeModal();
                    Notifications.message("danger", "", "Error deleting " + selectedUser.username);
                });

        }

    }

})();