/// <reference path="../../../typings/tsd.d.ts" />

export class LdapService {
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest;
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setFullResponse(true);
        });
    }

    saveLdapConfig(config){
        return this.restFull.all('ldap').post(config);
    }

    getLdapConfig() {
        return this.rest.one('ldap').get().then(function(config) {
            return config;
        });
    }
}
