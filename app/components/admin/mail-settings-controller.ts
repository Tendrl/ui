import {EmailService} from '../rest/email';

export class EmailController {
    private mailNotification:boolean;
    private smtpServer:string;
    private port:number;
    private useSsl:boolean;
    private useTls:boolean;
    private encryption:string;
    private mailId:string;
    private password:string;
    private from:string;
    private subPrefix:string;
    private recipent:any;
    private skipVerify:boolean;
    private errorMsg:boolean;

     static $inject: Array<string> = [
        '$location',
        'EmailService',
    ];
    constructor(
        private $location: ng.ILocationService,
        private EmailService:EmailService) {
            this.getMailNotificationSettings();
    }

    public save():void {
        if(this.useSsl == true){
            this.encryption='ssl';
        }
        else if(this.useTls == true){
            this.encryption='tls';
        }
        else {
            this.encryption = 'ssl';
        }
        var notifier = {
            mailnotification: this.mailNotification,
            smtpserver : this.smtpServer,
            port : parseInt(this.port.toString()),
            encryption : this.encryption,
            mailid : this.mailId,
            password : this.password,
            subprefix : this.subPrefix,
            skipverify :this.skipVerify
        };
        this.EmailService.saveMailSettings(notifier).then((result) => {
            if(result.status === 200) {
                this.errorMsg = false;
            }
        }).catch((result)=>{
            if(result.status !=200){
                this.errorMsg = true;
            }
        });
     }

      public getMailNotificationSettings(){
         this.EmailService.getMailNotifier().then((notifier)=>{
            this.mailId = notifier.mailid;
            this.port = notifier.port;
            this.skipVerify = notifier.skipverify;
            this.smtpServer = notifier.smtpserver;
            this.encryption = notifier.encryption;
            this.mailNotification = notifier.mailnotification;
            this.subPrefix = notifier.subprefix;
        });
     }
}