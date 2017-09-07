(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("userStore", userStore);

    /*@ngInject*/
    function userStore($state, $q, userFactory, AuthManager) {
        var store = this;
        store.users = [];

        store.getUserList = function() {
            var list,
                deferred;

            deferred = $q.defer();
            userFactory.getUserList()
                .then(function(data) {
                    if (data) {
                        list = _setupUserListData(data);
                        store.users = list;
                    }
                    deferred.resolve(list);
                });


            function _setupUserListData(data) {
                var i,
                    j,
                    length = data.length,
                    userList = [],
                    index,
                    user;

                for (i = 0; i < length; i++) {
                    user = {};
                    user.username = data[i].username;
                    user.name = data[i].name;
                    if (data[i].status === "true") {
                        user.status = "enabled";
                    } else if (data[i].status === "false") {
                        user.status = "disabled";
                    }
                    user.role = data[i].role;
                    if (data[i].email_notifications === "true") {
                        user.notification = "enabled";
                    } else if (data[i].email_notifications === "false") {
                        user.notification = "disabled";
                    }
                    user.email = data[i].email;
                    userList.push(user);
                }
                return userList;
            }

            return deferred.promise;
        };

        store.createUser = function(user) {
            var list,
                deferred,
                newUser;

            newUser = _createUserData(user);
            deferred = $q.defer();
            userFactory.createUser(newUser)
                .then(function(response) {
                    deferred.resolve(response);;
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        store.editUser = function(user) {
            var updateUser,
                deferred;

            updateUser = _createUserData(user);
            deferred = $q.defer();
            userFactory.editUser(updateUser)
                .then(function(response) {
                    deferred.resolve(response);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        store.getUserDetail = function(username) {
            var i,
                userDetail = {},
                length = store.users.length;

            for (i = 0; i < length; i++) {

                if (store.users[i].username === username) {
                    userDetail = store.users[i];
                    break;
                }
            }

            return userDetail;
        };

        store.getUserInfo = function() {
            var deferred;

            deferred = $q.defer();
            userFactory.getUserInfo()
                .then(function(data) {
                    AuthManager.setUserRole(data.role);
                    deferred.resolve(data);
                });

            return deferred.promise;
        };

        store.doActionOnUser = function(username) {
            var deferred;

            deferred = $q.defer();
            userFactory.doActionOnUser(username)
                .then(function(data) {
                    deferred.resolve(data);
                }).catch(function(e) {
                    deferred.reject(e);
                });

            return deferred.promise;
        };

        function _createUserData(user) {
            var data = {};
            data.name = user.name;
            data.username = user.username;
            data.email = user.email;
            data.role = user.role;
            data.password = user.password;
            data.password_confirmation = user.confirmPassword;
            data.email_notifications = user.emailNotification;
            return data;
        }

    }
})();