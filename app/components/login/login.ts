import {UserService} from '../rest/user';

export class LoginController {
    private errorMsg;
    static $inject: Array<string> = [
        '$location',
        'UserService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService) {
    }

    public login(user) {
        if (user && user.username && user.password) {
            this.errorMsg = "";
            var userObject = {
                "username": user.username,
                "password": user.password
            }
            this.UserService.login(userObject)
                .then(() => {
                    this.$location.path('/dashboard');
                }).catch(() => {
                    this.errorMsg = "Authentication Error!."
                });
        } else {
            this.errorMsg = "The username and password cannot be blank.";
        }
    }
}
