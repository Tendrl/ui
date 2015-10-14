import {UserService} from '../rest/user';

export class UserController {
    private errorMsg;
    private userList : Array<any>;
    static $inject: Array<string> = [
        '$location',
        'UserService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService) {
        this.getUsers();
    }
   
    public getUsers(){
        this.UserService.getUsers().then((users)=>{
            this.userList = users;
        });
    }
           
    public addUser(): void {
        this.$location.path('/admin/new');
    }
}
