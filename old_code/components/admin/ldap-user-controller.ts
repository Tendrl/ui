import {UserService} from '../rest/user';

export class LdapUserController {
    private errorMsg;
    private userList : Array<any>;
    private allUserList : Array<any>;
    private pageNo = 1;
    private pageSize = 10;
    private totalPages = 1;
    private search = "";

    static $inject: Array<string> = [
        '$location',
        'UserService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService) {
        this.getUsers();
        this.getLdapUsers();
    }

    public getLdapUsers(){
        this.UserService.getLdapUsersPage(this.search,this.pageNo,this.pageSize).then((data:any)=>{
            this.userList = data.users;
            this.totalPages = Math.ceil(data.totalcount/this.pageSize);
            var diff = _.difference(_.pluck(this.userList, "username"), _.pluck(this.allUserList, "username"));
            this.userList = _.filter(this.userList, function(obj) {
                var index = diff.indexOf(obj.username);
                if(index >= 0 ){
                    obj.imported = false;
                }
                   return true;
                 });
        });
    }

   public getUsers(){
        this.UserService.getUsers().then((users)=>{
            this.allUserList = users;
        });
    }

    public addLdapUser(user){
        this.UserService.addUser(user).then((user)=>{
        });
    }

    public paginate(pageNo) {
        if(pageNo<1 || pageNo > this.totalPages)
            return;
        this.pageNo = pageNo;
        this.getLdapUsers();
    }

    public cancel(){
        this.$location.path('/admin');
    }
}
