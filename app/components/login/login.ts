import {UtilService} from '../rest/util';

export class LoginController {
    private errorMsg;
    static $inject: Array<string> = [
        '$location',
        'UtilService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UtilService: UtilService) {
    }

    public login(user) {
        if (user && user.username && user.password) {
            this.errorMsg = "";
            var userObject = {
                "username": user.username,
                "password": user.password
            }
            this.UtilService.getVerifyUser(userObject)
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
