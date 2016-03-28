/// <reference path="../../../typings/tsd.d.ts" />

interface AppConfig {
    ceph_min_monitors?: number;
}

export class ConfigService {
    private config: AppConfig;
    static $inject: Array<string> = ['$q','Restangular'];
    constructor(
        private $q: ng.IQService,
        private rest: restangular.ICollection) {
    }

    public initConfig() {
        return this.rest.all('config').customGET('config.json').then((config) => {
            this.config = config;
        }, (reason) => {
            this.config = {};
        });
    }

    public getConfig(): ng.IPromise<AppConfig> {
        var defered = this.$q.defer();
        if(this.config) {
            defered.resolve(this.config);
        }
        else {
            this.initConfig().then(() => {
                defered.resolve(this.config);
            });
        }
        return defered.promise;
    }
}
