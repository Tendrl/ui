import {UserService} from '../rest/user';

export class UserEditController {
    private errorMsg;
    private userId:string;
    private firstName:string;
    private lastName:string;
    private email:string;
    private password:string;
    private confirmpassword:string;
    private oldpassword:string;
    private status:boolean;
    private notificationenabled:boolean;
    private errorMessage:string;

    static $inject: Array<string> = [
        '$location',
        'UserService',
        '$routeParams',
    ];

    constructor(
        private $location: ng.ILocationService,
        private UserService: UserService,
        private routeParamsSvc: ng.route.IRouteParamsService) {
        this.userId =  this.routeParamsSvc['userid'];
        if (!this.userId) {
            this.getUserByUserId('me');
        }
        else {
            this.getUserByUserId(this.userId);
        }
    }
   
    public getUserByUserId(userId):void{
        this.UserService.getUserByUserId(userId).then((user: any)=>{
            this.userId = user.username;
            this.firstName = user.firstname;
            this.lastName = user.lastname;
            this.email = user.email;
            this.status = user.status;
            this.notificationenabled = user.notificationenabled;
        });
    }

    public saveSettings(modalHide):void {
        this.errorMessage = "";
        if(this.password === this.confirmpassword && this.password.length > 0) {
            var setting = {
                    password: this.password,
                    oldpassword: this.oldpassword
            };
            this.UserService.saveUserSetting(this.userId,setting).then((result) => {
                if(result.status === 200){
                     modalHide();
                }
            }).catch((result) => {
                if(result.status === 500){
                    this.errorMessage = "Old password does not match!";
                }
            });
        }else {
            this.errorMessage = "Confirm password does not match!";
        }
    }

    public save():void {
        var user: any = {
            email: this.email,
            firstname: this.firstName,
            lastname: this.lastName,
            groups: [],
            role: "admin"
        };
        if(this.password && this.password.length > 0) {
            user.password = this.password;
        }
        user.status = this.status;
        user.notificationenabled = this.notificationenabled;

        this.UserService.updateUser(this.userId,user).then((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
        });
    }

    public deleteUser(userId):void {
        this.UserService.deleteUser(userId).then((result) => {
            if(result.status === 200) {
                this.$location.path('/admin');
            }
        });
    }
    
    public cancel(): void {

        this.$location.path('/admin');
    }
}
