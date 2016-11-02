/// <reference path="../../../typings/tsd.d.ts" />
export interface StorageProfile {
    name: string,
    rule: { disktype: number, speed: number },
    priority: number,
    default: boolean
}

export class StorageProfileService {
    rest: restangular.IService;
    restFull: restangular.IService;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest;
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **getList**
    // **@returns** a promise with all Storage Profiles.
    getList() {
        return this.rest.all('storageprofiles').getList<StorageProfile>().then(function(storageprofiles: Array<StorageProfile>) {
            return storageprofiles;
        });
    }

    // **getByName**
    // **@returns** a promise with a Storage Profile.
    getByName(name: string) {
        return this.rest.one('storageprofiles', name).get<StorageProfile>().then(function(storageprofile: StorageProfile) {
            return storageprofile;
        });
    }

    // **Add**
    // **@returns** add a new storage profile
    add(storageprofile: {}) {
        return this.restFull.all('storageprofiles').post(storageprofile);
    }
}
