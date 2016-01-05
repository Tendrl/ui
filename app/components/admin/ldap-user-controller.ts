import {UserService} from '../rest/user';

export class LdapUserController {
    private errorMsg;
    private userList : Array<any>;
    static $inject: Array<string> = [
        '$location',
        'UserService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService) {
        this.getLdapUsers();
    }
   
    public getLdapUsers(){
        this.UserService.getLdapUsers().then((users)=>{
            this.userList = users;
        });
    }

    public cancel(){
        this.$location.path('/admin');
    }
}
