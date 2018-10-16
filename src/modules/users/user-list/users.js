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
    function userController($scope, $rootScope, $state, $uibModal, $interval, config, userStore, AuthManager, Notifications, utils) {

        var vm = this,
            userList,
            updatedNotification;

        $rootScope.selectedClusterOption = null;
        vm.userList = [];
        vm.filtersText = "";
        vm.filteredUserList = [];
        vm.filters = [];

        vm.isDataLoading = true;
        vm.addNewUser = addNewUser;
        vm.editUserDetail = editUserDetail;
        vm.toggleNotification = toggleNotification;

        vm.filterConfig = {
            fields: [{
                id: "username",
                title: "User ID",
                placeholder: "Filter by User ID",
                filterType: "text"
            }, {
                id: "name",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "role",
                title: "Role",
                placeholder: "Filter by Role",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

        /*BEGIN Delete User modal*/
        vm.deleteUser = deleteUser;
        vm.closeDeleteUserModal = closeDeleteUserModal;
        vm.deleteUserModalTitle = "Delete User";
        vm.deleteUserModalId = "deleteUserModal";
        vm.deleteUserModalTemplate = "/modules/users/delete-user/delete-user.html";
        vm.deleteUserModalActionButtons = [{
            label: "Cancel",
            isCancel: true
        }, {
            label: "Delete",
            class: "btn-danger custom-class",
            actionFn: function() {
                userStore.deleteUser(vm.userToDelete.username)
                    .then(function(data) {
                        vm.userToDelete.showDeleteUserModal = false;
                        userStore.getUserList()
                            .then(function(data) {
                                if (data !== null) {
                                    $rootScope.$broadcast("UpdatedUserList", data);
                                }
                                Notifications.message("success", "", vm.userToDelete.username + " deleted successfully.");
                            });

                    }).catch(function(e) {
                        vm.userToDelete.showDeleteUserModal = false;
                        Notifications.message("danger", "", "Error in deleting " + vm.userToDelete.username);
                    });

            }

        }];

        function deleteUser(user) {

            user.showDeleteUserModal = true;
            vm.userToDelete = {};
            vm.userToDelete = user;
        }

        function closeDeleteUserModal(user) {
            user.showDeleteUserModal = false;
        }
        /*END Delete User modal*/


        //To refresh the selector selected option
        utils.refershSelector();
        init();

        function init() {
            userStore.getUserList()
                .then(function(data) {
                    vm.userList = data;
                    vm.filteredUserList = vm.userList;
                    _filterChange(vm.filters);
                }).catch(function(e) {
                    vm.userList = [];
                    vm.filteredUserList = [];
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        $scope.$on("UpdatedUserList", function(event, data) {
            if (data !== null) {
                vm.userList = data;
                vm.filteredUserList = vm.userList;
                _filterChange(vm.filters);
            }
        });

        function addNewUser() {
            $state.go("add-user");
        }

        function editUserDetail(username) {
            $state.go("edit-user", { userId: username });
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

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "username") {
                match = item.username.match(re) !== null;
            } else if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "role") {
                match = item.role.match(re) !== null;
            }

            return match;
        };

        function _matchesFilters(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!_matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        };

        function _applyFilters(filters) {
            vm.filteredUserList = [];
            if (filters && filters.length > 0) {
                vm.userList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredUserList.push(item);
                    }
                });
            } else {
                vm.filteredUserList = vm.userList;
            }
            vm.filterConfig.resultsCount = vm.filteredUserList.length;
        }

        function _filterChange(filters) {
            vm.filtersText = "";
            vm.filters = filters;
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });
            _applyFilters(filters);
        }
    }

})();