/// <reference path="../../../typings/tsd.d.ts" />

export class UtilService {
    config: Array<any>;
    rest: restangular.ICollection;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest:restangular.ICollection) {
        this.rest = rest;
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
    getSshFingerprint(ipAddress) {
        return this.rest.one('utils/get_ssh_fingerprint', ipAddress).get().then(function(result) {
            return result['ssh_key_fingerprint'];
        });
    }

    // **get**
    // **@returns** a promise with IP Address.
    getIpAddress(hostname) {
        return this.rest.one('utils/resolve_hostname', hostname).get().then(function(result) {
            if(!_.isEmpty(result['IP_Address'])) {
                return _.first(result['IP_Address']);
            }
            return;
        });
    }

    // **acceptHosts**
    // **@returns** accept the salt-keys of the hosts.
    acceptHosts(hosts) {
        return this.rest.all('utils/accept-hosts').post(hosts);
    }
}

