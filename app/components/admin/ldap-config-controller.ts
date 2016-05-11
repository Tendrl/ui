import {LdapService} from '../rest/ldap';

export class LdapConfigController {
    private errorMsg: boolean;
    private ldapType: string;
    private ldapServer : string;
    private port: string;
    private base: string;
    private domainAdmin: string;
    private password:string;

    static $inject: Array<string> = [
        '$location',
        'LdapService',
    ];

    constructor(
        private $location: ng.ILocationService,
        private LdapService: LdapService) {
            this.getConfig();
    }

    public save():void {
        var config = {
            ldaptype: this.ldapType,
            ldapserver: this.ldapServer,
            port: parseInt(this.port),
            base: this.base,
            domainadmin: this.domainAdmin,
            password: this.password
        };

        this.LdapService.saveLdapConfig(config).then((result) => {
            if(result.status === 200) {
                this.errorMsg = false;
            }else{
                this.errorMsg = true;
            }
        });
     }

     public getConfig(){
         this.LdapService.getLdapConfig().then((config)=>{
            this.ldapType = config.ldaptype,
            this.ldapServer = config.ldapserver,
            this.port = config.port,
            this.base =  config.base,
            this.domainAdmin = config.domainadmin
        });
     }

}
