(function () {
    "use strict";

    angular.module("TendrlModule")
        .component("login", {

            restrict: "E",
            templateUrl: "/modules/login/login.html",
            bindings: {},
            controller: LoginController,
            controllerAs: "loginCntrl"
        });

    /*@ngInject*/
    function LoginController($scope, $window, $location, $state, $rootScope, AuthManager) {

        /* Controller instance */
        var vm = this;
        $rootScope.isAPINotFoundError = false;

        if(AuthManager.isUserLoggedIn){
            $state.go("cluster")
        }

        vm.user = {};
        vm.showPassword = "password";
        vm.errorMsg = "";
        vm.login = login;

        function login() {

            vm.formSubmitInProgress = true;

            if (validateUiFields()) {

                AuthManager.authenticateUser(vm.user)
                .then(function (data) {
                    AuthManager.isUserLoggedIn = true;
                    AuthManager.setAuthHeader();
                })
                .then(function () {
                    $state.go("cluster");
                    $rootScope.isNavigationShow = true;
                })
                .catch(function(){
                    AuthManager.isUserLoggedIn = false;
                    vm.errorMsg = "The username or password you entered does not match our records. Please try again.";
                    vm.user.password = "";
                })
                .finally(function () {
                    vm.formSubmitInProgress = false;
                });
            } else {
                vm.formSubmitInProgress = false;
            }
        };

        function validateUiFields() {
            var isFormValid = true,
            form = vm.signInForm;

            if (form.username.$invalid) {
                vm.invalidFormMessage = "Please specify valid email id.";
                isFormValid = false;
            } else if (form.password.$invalid) {
                vm.invalidFormMessage = "Please specify valid password.";
                isFormValid = false;
            }

            return isFormValid;

        }

    }

})();
