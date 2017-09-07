(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("deleteUserController", deleteUserController);

    /*@ngInject*/
    function deleteUserController($rootScope, $scope, $state, userStore, selectedUser, Notifications) {

        var vm = this,
            userId;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.userId = selectedUser.username;

        vm.modalHeader = {
            "title": "Delete User",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Yes",
            "classname": "btn-primary",
            "onCall": vm.confirmModal
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf StopVolumeController
         */

        function cancelModal() {
            $state.go("users");
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
            userStore.doActionOnUser(selectedUser.username)
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