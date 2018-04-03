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
    function userController($scope, $rootScope, $state, $uibModal, $interval, config, userStore, AuthManager, Notifications) {

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
        vm.deleteUser = deleteUser;
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
            }
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