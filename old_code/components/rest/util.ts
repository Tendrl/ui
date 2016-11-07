/// <reference path="../../../typings/tsd.d.ts" />

export class UtilService {
    config: Array<any>;
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest:restangular.ICollection) {
       this.rest = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1');
        });
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setBaseUrl('/api/v1');
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **getVerify**
    // **@returns** a promise with user varification.
    getVerifyUser(userObject) {
        return this.rest.all('auth/login').post(userObject);
    }

    // **getVerify**
    // **@returns** a promise with host varification.
    getVerifyHost(hostObject) {
        return this.rest.all('utils/validate-host').post(hostObject);
    }

    // **getList**
    // **@returns** a promise with ssh fingerprint.
    getSshFingerprint(hostname) {
        return this.rest.one('utils/ssh_fingerprint', hostname).get().then(function(result) {
            return result.sshfingerprint;
        });
    }

    // **get**
    // **@returns** a promise with IP Addresses.
    getIpAddresses(hostname: string) {
        return this.rest.one('utils/lookup_node', hostname).get().then(function(result: Array<string>) {
            return result;
        });
    }

    // **acceptHost**
    // **@returns** accept the salt-key of the node.
    acceptHost(hostname: string, saltfingerprint: { saltfingerprint: string }) {
        return this.restFull.one('unmanaged_nodes', hostname).post('accept', saltfingerprint);
    }
}

