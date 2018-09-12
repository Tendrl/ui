(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("tendrlHeader", {

            templateUrl: "/modules/base/header/header.html",
            controller: headerController,
            controllerAs: "header"
        });

    /*@ngInject*/
    function headerController($rootScope, $state, $scope, $uibModal, AuthManager, utils, Notifications, userStore, deviceDetector, config) {

        var vm = this,
            currentUser;

        vm.showAlerts = false;
        vm.searchBy = {};
        vm.filterBy = "";
        vm.severity = "";
        vm.releaseVersion = config.releaseVersion;

        vm.notificationClose = notificationClose;
        vm.logout = logout;
        vm.homePage = homePage;
        vm.setNotificationFlag = setNotificationFlag;
        vm.goToClusterPage = goToClusterPage;
        vm.getClusterName = getClusterName;
        vm.closeNotificationBar = closeNotificationBar;

        vm.filterBySeverity = filterBySeverity;
        vm.setSeverity = setSeverity;
        vm.clearAllFilters = clearAllFilters;
        vm.toggleNav = toggleNav;
        vm.getUserRole = getUserRole;
        vm.updateViewing = updateViewing;
        vm.device = deviceDetector;

        $rootScope.notification = Notifications.data;
        vm.htmlContent = true;

        $scope.$on("GotAlertData", function(event, data) {
            if ($rootScope.alertList !== null) {
                vm.alertList = $rootScope.alertList;
                vm.severityList = utils.getAlertSeverityList(vm.alertList);
            }
        });

        $rootScope.$on("GotClusterData", function(event, data) {
            //To refresh the selector selected option
            utils.refershSelector();
        });

        /*BEGIN user setting modal*/
        vm.userScope = {};
        vm.currentState = $state.current.name;
        vm.showUserSetting = false;
        vm.userSetting = userSetting;
        vm.closeUserSetting = closeUserSetting;
        vm.toggleTypePassword = toggleTypePassword;
        vm.toggleConfirmPassword = toggleConfirmPassword;
        vm.userSettingId = "userSettingModal";
        vm.userSettingTitle = "My Settings";
        vm.userSettingTemplate = "/modules/base/user-setting/user-setting.html";
        vm.isForm = true;

        vm.userSettingActionButtons = [{
            label: "Cancel",
            isCancel: true
        }, {
            label: "Save",
            class: "btn-primary custom-class",
            actionFn: function() {
                vm.userScope.formSubmitInProgress = true;
                if (_validateUIFields()) {
                    vm.userScope.user.notification = vm.userScope.user.email_notifications;
                    userStore.editUser(vm.userScope.user)
                        .then(function(data) {
                            vm.showUserSetting = false;
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
                                        vm.userScope.errorMsg = "Email is already taken. Please use different one.";
                                    } else if (messages.indexOf("is invalid") !== -1) {
                                        vm.userScope.errorMsg = "Please enter a valid Email Id";
                                    }
                                } else if (keys.indexOf("name") !== -1) {
                                    vm.userScope.errorMsg = "Name is too short (minimum is 4 characters).";
                                }
                            } else {
                                vm.showUserSetting = false;
                                Notifications.message("danger", "", " Failed to update profile.");
                            }
                        });


                } else {
                    vm.userScope.formSubmitInProgress = false;
                }
            }
        }];

        function userSetting() {
            vm.userScope.typePassword = false;
            vm.userScope.confirmPassword = false;
            vm.userScope.isDataLoading = true;
            vm.showUserSetting = true;
            userStore.getUserInfo()
                .then(function(data) {
                    vm.userScope.isDataLoading = false;
                    vm.userScope.user = data;
                    vm.userScope.user["password"] = "";
                    vm.userScope.user["confirmPassword"] = "";
                });
        }

        function toggleTypePassword() {
            vm.userScope.typePassword = !vm.userScope.typePassword;
        }

        function toggleConfirmPassword() {
            vm.userScope.confirmPassword = !vm.userScope.confirmPassword;
        }

        function closeUserSetting(dismissCause) {
            vm.showUserSetting = false;
            vm.userScope.errorMsg = "";
        }

        /***Private Functions***/

        function _validateUIFields() {
            var isFormValid = true,
                form = vm.userScope.user;
            if (form.name.$invalid) {
                vm.userScope.errorMsg = "Please specify valid Name."
                isFormValid = false;
            } else if (!_isPasswordSame()) {
                //vm.userScope.errorMsg = "Password and Confirm Password doesn't match.";
                isFormValid = false;
                Notifications.message("danger", "", "Your password and confirmation password do not match. Go to My Settings to reset your password.");
            } else if (form.password.$invalid) {
                vm.userScope.errorMsg = "Password should be 8 characters minimum";
                isFormValid = false;
            } else if (form.email.$invalid) {
                vm.userScope.errorMsg = "Please enter Email id.";
                isFormValid = false;
            }

            return isFormValid;
        }

        function _isPasswordSame() {
            if (vm.userScope.user.password == vm.userScope.user.confirmPassword) {
                return true;
            } else {
                return false;
            }
        }
        /*END Unmanage confirm modal*/

        init();

        function init() {
            _getUserName();
        }

        function _getUserName() {
            if (!userStore.users.length) {
                userStore.getUserInfo()
                    .then(function(data) {
                        vm.currentUser = data.name;
                    });
            }
        }

        function getUserRole() {
            return AuthManager.getUserRole();
        }

        function toggleNav(event) {
            $rootScope.$emit('toggleNav');
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        function setNotificationFlag() {
            vm.showAlerts = !vm.showAlerts;
        }

        function notificationClose(data) {
            Notifications.remove(data);
        }

        function closeNotificationBar() {
            vm.showAlerts = false;
        }

        function updateViewing(viewing, data) {
            Notifications.setViewing(data, viewing);
        }

        function logout() {
            AuthManager.logout()
                .then(function(data) {
                    AuthManager.setFlags();
                })
                .then(function() {
                    $state.go("login");
                })
                .catch(function(e) {
                    AuthManager.isUserLoggedIn = true;
                    console.log("Logout Error: Logout Not Successful");
                });
        }

        function homePage() {
            $state.go("clusters");
        }

        function goToClusterPage() {
            if ($rootScope.selectedClusterOption === "allClusters") {
                $state.go("clusters");
            } else {
                $state.go("cluster-hosts", { clusterId: $rootScope.selectedClusterOption });
            }
        }

        function getClusterName(id) {

            if (!id) {
                return "Select a cluster...";
            }

            if (id === "allClusters") {
                return "All Clusters";
            } else {

                var data = $rootScope.clusterData,
                    len = data.length,
                    i;

                for (i = 0; i < len; i++) {
                    if (id === data[i].clusterId) {
                        return data[i].name;
                    }
                }
            }
        }

        function filterBySeverity(list) {
            if (!vm.severity) {
                return list;
            } else if (list.severity.charAt(0) === vm.severity.charAt(0)) {
                return list;
            }
        }

        function setSeverity(value) {
            vm.severity = value;
            vm.filterBy = "severity";
            vm.filterByValue = "Severity";
            vm.searchBy[vm.filterBy] = value;
        }

        function clearAllFilters() {
            vm.searchBy = {};
            vm.filterBy = "";
            vm.severity = "";
        }
    }

})();