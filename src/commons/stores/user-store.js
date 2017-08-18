(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .service("userStore", userStore);

    /*@ngInject*/
    function userStore($state, $q, userFactory) {
        var store = this;

        store.getUserList = function() {
            var list,
                deffered;

            deffered = $q.defer();
            userFactory.getUserList()
                .then(function(data) {
                    if (data) {
                        list = _setupUserListData(data);
                    }
                    deffered.resolve(list);
                });


            function _generateName(name) {
                var userName = [],
                    temp1 = [];

                temp1 = name.split(" ");
                userName.firstName = temp1[0];
                userName.lastName = temp1[1];
                return userName;
            };



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
                    user.firstName = _generateName(data[i].name).firstName;
                    user.lastName = _generateName(data[i].name).lastName;
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
            };

            return deffered.promise;
        };

        store.createUser = function(user) {
            var list,
                deffered;
            var newUser = _createUserData(user);
            deffered = $q.defer();
            userFactory.createUser(newUser)
                .then(function(response) {
                    return response;
                });


            function _createUserData(user) {
                var data = {};
                data.name = _getUserName(user.firstName, user.lastName);
                data.username = user.username;
                data.email = user.email;
                data.role = user.role;
                data.password = user.password;
                data.password_confirmation = user.confirmPassword;
                data.email_notification = user.emailNotification;
                return data;
            };



            function _getUserName(first, last) {
                return (first + " " + last);
            };

            return deffered.promise;

        };

    }
})();