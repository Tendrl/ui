/// <reference path="../../../typings/tsd.d.ts" />

export class UserService {
	config: Array<any>;
	rest: restangular.ICollection;
	static $inject: Array<string> = ['Restangular'];
	constructor(rest:restangular.ICollection) {
		this.rest = rest;
	}

    // **get**
    // **@returns** a promise with a user with specific id.
    get(id) {
        return this.rest.one('user', id).get().then(function(lines) {
            return lines;
        });
    }

    // **me**
    // **@returns** a promise with a specific user.
    me() {
        return this.get('me');
    }

    // **logout**
    // **@returns** a promise with a user logout.
    logout() {
        return this.rest.one('auth').one('logout').get();
    }
}
