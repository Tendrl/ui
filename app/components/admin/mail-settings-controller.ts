import {EmailService} from '../rest/email';

export class EmailController {
    private mailNotification: boolean;
    private smtpServer: string;
    private port: number;
    private useSsl: boolean;
    private useTls: boolean;
    private encryption: string;
    private mailId: string;
    private password: string;
    private from: string;
    private subPrefix: string;
    private recipent: any;
    private skipVerify: boolean;
    private recipient: string;
    private msg: string;
    private notification: Object;
    private onloadSave: boolean;
    private onloadTest: boolean;
    private showNotification: boolean;

    static $inject: Array<string> = [
        '$location',
        'EmailService',
    ];
    constructor(
        private $location: ng.ILocationService,
        private EmailService: EmailService) {
        this.getMailNotificationSettings();
        this.onloadSave = false;
        this.onloadTest = false;
    }

    public save(): void {
        this.onloadSave = true;
        if (this.useSsl === true) {
            this.encryption = 'ssl';
        }
        else if (this.useTls === true) {
            this.encryption = 'tls';
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
            if (result.status === 200) {
                this.onloadSave = false;
                this.notification = {
                    type: "success",
                    header: "Success : ",
                    message: "Configuration Successfully Saved"
                }
            }
        }).catch((result) => {
            if (result.status !== 200) {
                this.onloadSave = false;
                this.notification = {
                    type: "danger",
                    header: "Failed : ",
                    message: result.data
                }
            }
        });
        this.showNotification = true;
    }

    public test(): void {
        this.onloadTest = true;
        if (this.useSsl === true) {
            this.encryption = 'ssl';
        }
        else if (this.useTls === true) {
            this.encryption = 'tls';
        }
        var notifier = {
            mailnotification: this.mailNotification,
            smtpserver: this.smtpServer,
            port: this.port,
            encryption: this.encryption,
            mailid: this.mailId,
            password: this.password,
            subprefix: this.subPrefix,
            skipverify: this.skipVerify,
            recipient: this.recipient
        };
        this.EmailService.testMailSettings(notifier).then((result) => {
            if (result.status === 200) {
                this.onloadTest = false;
                this.notification = {
                    type: "success",
                    header: "Success : ",
                    message: "Test mail is sent successfully"
                }
            }
        }).catch((result) => {
            if (result.status !== 200) {
                this.onloadTest = false;
                this.notification = {
                    type: "danger",
                    header: "Failed : ",
                    message: result.data
                }
            }
        });
        this.showNotification = true;
    }

    public getMailNotificationSettings() {
        this.EmailService.getMailNotifier().then((notifier) => {
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
