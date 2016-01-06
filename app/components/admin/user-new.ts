import {UserService} from '../rest/user';

export class UserNewController {
    private errorMsg;
    private userId:string;
    private firstName:string;
    private lastName:string;
    private email:string;
    private password:string;
    private notificationenabled:boolean;
    private status:boolean;

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
            password: this.password,
            notificationenabled: this.notificationenabled,
            status: this.status
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
