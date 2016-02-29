/// <reference path="../../../typings/tsd.d.ts" />

export class EmailService{
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1/');
            RestangularConfigurer.setFullResponse(true);
        });
    }

    saveMailSettings(notifier){
        return this.restFull.all('mailnotifier').customPUT(notifier);
    }
    testMailSettings(notifier){
        return this.restFull.all('testmailnotifier').post(notifier);
    }
    getMailNotifier(){
         return this.rest.one('mailnotifier').get().then(function(notifier) {
            return notifier;
        });
    }
}