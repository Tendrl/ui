(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .factory("AuthManager", AuthManager);

    /*@ngInject*/
    function AuthManager($http, $q, $state, $rootScope, config, $timeout) {

        var authApiFactory, navPlugin;

        function create_request(request_type, endpoint) {
            return {
                method: request_type,
                url: config.baseUrl + endpoint,
                data: {}
            }
        }

        authApiFactory = {
            authenticateUser: authenticate,
            isUserLoggedIn: false,
            globalUser: globalUser(),
            getUserInfo: getUserInfo,
            clearCredentials: clearCredentials,
            setFlags: setFlags,
            logout: logout,
            setAuthHeader: setAuthHeader,
            handleUnauthApi: handleUnauthApi,
            isAuthenticated: isAuthenticated,
            setUserRole: setUserRole,
            getUserRole: getUserRole,
            clearUserRole: clearUserRole
        };

        function setAuthHeader() {
            $http.defaults.headers.common["Authorization"] = "Bearer " + JSON.parse(localStorage.getItem("userInfo")).accessToken;
        }

        function globalUser() {
            return {
                "username": null,
                "accessToken": null
            };
        }

        function setUserInfo(user, accesstoken) {
            authApiFactory.globalUser.username = user.username;
            authApiFactory.globalUser.accessToken = accesstoken;
            localStorage.setItem("userInfo", JSON.stringify(authApiFactory.globalUser));
        }

        function setUserRole(role) {
            localStorage.setItem("userRole", role);
            $rootScope.userRole = role;
        }

        function clearUserRole() {
            localStorage.clear("userRole");
        }

        function getUserRole() {
            return localStorage.getItem("userRole");
        };

        function getUserInfo() {
            return JSON.parse(localStorage.getItem("userInfo"));
        }

        function clearCredentials() {
            authApiFactory.globalUser.username = null;
            authApiFactory.globalUser.accessToken = null;
            localStorage.clear("userInfo");
            authApiFactory.isUserLoggedIn = false;
        }

        function hideNav() {
            if (navPlugin.isVisible()) {
                navPlugin.hideMenu();
                return true;
            }
            return false;
        }

        function setFlags() {
            $rootScope.isHeaderShow = false;
            $rootScope.isAPINotFoundError = false;
            navPlugin = $().setupVerticalNavigation(true);
            hideNav();
        }

        function logout() {
            var req = create_request("DELETE", "logout");

            return $http(req).then(function(response) {
                    authApiFactory.clearCredentials();
                    authApiFactory.clearUserRole();
                    $http.defaults.headers.common["Authorization"] = "";
                    $rootScope.$broadcast("UserLogsOut");
                    return response.data;
                })
                .catch(function(response) {
                    authApiFactory.clearCredentials();
                    authApiFactory.setFlags();
                    $state.go("login");
                    return $q.reject({});
                });
        }


        function authenticate(user) {
            var req = create_request("POST", "login");

            if (!!user) {
                req.data.username = user.username;
                req.data.password = user.password;

                return $http(req).then(function(response) {

                        if (response.data.access_token) {
                            setUserInfo(user, response.data.access_token);
                            return response.data;
                        } else {
                            return $q.reject({});
                        }

                    })
                    .catch(function(error) {
                        return $q.reject(error);
                    });
            }
        }

        function handleUnauthApi() {
            authApiFactory.clearCredentials();
            authApiFactory.setFlags();
            $rootScope.$broadcast("UserLogsOut");
            $state.go("login");
        }


        function isAuthenticated(state) {
            var unAuthStates = ["users", "edit-user", "add-user"],
                i,
                len = unAuthStates.length;

            if (authApiFactory.getUserRole() !== "admin") {
                for (i = 0; i < len; i++) {
                    if (state === unAuthStates[i]) {
                        return true;
                    }
                }
            }

            return false;
        }

        return authApiFactory;
    }

})();
