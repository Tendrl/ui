/// <reference path="../../../typings/tsd.d.ts" />

export class SystemService{
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest;
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setFullResponse(true);
        });
    }

    getAboutDetails(){
        return this.rest.one('about').get().then(function(about){
            return about;
        });
    }
}
