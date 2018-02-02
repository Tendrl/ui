(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("userFactory", userFactory);

    /*@ngInject*/
    function userFactory($state, $q, $http, utils, config, AuthManager) {
        var vm = this;

        /**
         * @name getUserList
         * @desc Perform user operations
         * @memberOf userFactory
         */
        vm.getUserList = function(data) {
            var url,
                userRequest,
                request;

            url = config.baseUrl + "users";
            // url = "/api/GetUserList.json";

            userRequest = {
                method: "GET",
                url: url,
                data: data
            };

            request = angular.copy(userRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
                return null;
            });
        };

        vm.createUser = function(user) {
            var url,
                actionRequest,
                request;

            url = config.baseUrl + "users";
            // url = "/api/GetUserList.json";

            actionRequest = {
                method: "POST",
                url: url,
                data: user
            };
            request = angular.copy(actionRequest);
            return $http(request).then(function(response) {
                return response.data;
            }).catch(function(e) {
                utils.checkErrorCode(e);
                throw e;
            });
        };

        vm.editUser = function(user) {
            var url,
                actionRequest,
                request;

            url = config.baseUrl + "users/" + user.username;

            actionRequest = {
                method: "PUT",
                url: url,
                data: user
            };

            request = angular.copy(actionRequest);
            return $http(request).then(function(response) {
                return response.data;
            }).catch(function(e) {
                utils.checkErrorCode(e);
                throw e;
            });
        };

        vm.getUserInfo = function(userId) {
            var url, request, getUserDetailsRequest;

            url = config.baseUrl + "current_user";
            //url = "/api/GetUserDetails.json";

            getUserDetailsRequest = {
                method: "GET",
                url: url
            };

            request = angular.copy(getUserDetailsRequest);
            return $http(request).then(function(response) {
                return response.data;
            }, function(e) {
                utils.checkErrorCode(e);
            });
        };

        vm.deleteUser = function(username) {
            var url, deleteUserRequest, request;

            url = config.baseUrl + "users/" + username;
            // url = "/api/GetUserList.json";

            deleteUserRequest = {
                method: "DELETE",
                url: url,
                data: username
            };

            request = angular.copy(deleteUserRequest);

            return $http(request).then(function(response) {
                return response.data;
            }).catch(function(e) {
                utils.checkErrorCode(e);
                throw e;
            });
        };
    }

})();
