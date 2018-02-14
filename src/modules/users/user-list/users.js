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
    function userController($scope, $rootScope, $state, $uibModal, $interval, utils, config, userStore, AuthManager, Notifications) {

        var vm = this,
            userTimer,
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


        var matchesFilter = function(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, 'i');

            if (filter.id === 'username') {
                match = item.name.match(re) !== null;
            } else if (filter.id === 'name') {
                match = item.name.match(re) !== null;
            } else if (filter.id === 'role') {
                match = item.name.match(re) !== null;
            }
            return match;
        };

        var matchesFilters = function(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        };

        var applyFilters = function(filters) {
            vm.filteredUserList = [];
            if (filters && filters.length > 0) {
                vm.userList.forEach(function(item) {
                    if (matchesFilters(item, filters)) {
                        vm.filteredUserList.push(item);
                    }
                });
            } else {
                vm.filteredUserList = vm.userList;
            }
            vm.filterConfig.resultsCount = vm.filteredUserList.length;
        };

        var filterChange = function(filters) {
            vm.filtersText = "";
            vm.filters = filters;
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.filterCategory) {
                    vm.filtersText += ((filter.value.filterCategory.title || filter.value.filterCategory) +
                        filter.value.filterDelimiter + (filter.value.filterValue.title || filter.value.filterValue));
                } else if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });
            applyFilters(filters);
        };

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
            onFilterChange: filterChange
        };

        init();

        function init() {
            userStore.getUserList()
                .then(function(data) {
                    vm.isDataLoading = false;
                    vm.userList = data;
                    vm.filteredUserList = vm.userList;
                    filterChange(vm.filters);
                }).catch(function(e) {
                    vm.isDataLoading = false;
                });
        }

        $scope.$on("UpdatedUserList", function(event, data) {
            if (data !== null) {
                vm.userList = data;
            }
        });

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(userTimer);
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
    }

})();
