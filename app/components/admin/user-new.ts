import {UserService} from '../rest/user';

export class UserNewController {
    private errorMsg;
    private userId:string;
    private firstName:string;
    private lastName:string;
    private email:string;
    private password:string;

    static $inject: Array<string> = [
        '$location',
        'UserService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService) {
    }

    public save():void {
        var user = {
            username: this.userId,
            email: this.email,
            firstname: this.firstName,
            lastname: this.lastName,
            groups: [],
            role: "admin",
            password: this.password
        };
        this.UserService.addUser(user).then((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
        });
    }

    public cancel(): void {
        this.$location.path('/admin');
    }
}
