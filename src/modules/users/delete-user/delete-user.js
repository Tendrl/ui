(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("deleteUserController", deleteUserController);

    /*@ngInject*/
    function deleteUserController($rootScope, $scope, $state, userStore, selectedUser, Notifications) {

        var vm = this;

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;
        vm.userId = selectedUser;

        vm.modalHeader = {
            "title": "Delete User",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "type": "button",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Delete",
            "type": "submit",
            "classname": "btn-danger",
            "onCall": vm.confirmModal
        }];

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf deleteUserController                

         */

        function cancelModal() {
            $state.go("users");
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
            userStore.deleteUser(selectedUser)
                .then(function(data) {
                    vm.closeModal();
                    userStore.getUserList()
                        .then(function(data) {
                            if (data !== null) {
                                $rootScope.$broadcast("UpdatedUserList", data);
                            }
                            Notifications.message("success", "", selectedUser + " deleted Successfully.");
                        });

                }).catch(function(e) {
                    vm.closeModal();
                    Notifications.message("danger", "", "Error deleting " + selectedUser);
                });

        }

    }

})();