/// <reference path="../../../typings/tsd.d.ts" />

export class UserService {
    rest: restangular.IService;
    restFull: restangular.IService;
    currentUser: string;
    static $inject: Array<string> = ['Restangular'];
    constructor(rest: restangular.ICollection) {
        this.rest = rest;
        this.restFull = rest.withConfig((RestangularConfigurer) => {
            RestangularConfigurer.setFullResponse(true);
        });
    }

    // **get**
    // **@returns** a promise with a user with specific id.
    get(id) {
        return this.rest.one('users', id).get().then(function(user) {
            return user;
        });
    }

    // **login**
    // **@returns** a promise with user login.
    login(user: { username: string, password: string }) {
        this.currentUser = user.username;
        return this.rest.one('auth').post('login', user);
    }

    // **logout**
    // **@returns** a promise with a user logout.
    logout() {
        return this.rest.one('auth').post('logout');
    }
    
    // **getCurrentUser**
    // **@returns** a string with userid
    getCurrentUser(){
        return this.get('me');
    }

    // **getUsers**
    // **@returns** a promise with list of users
    getUsers(){
        return this.rest.all('users').getList().then(function(users){
            return users;
        });
    }

    // **getUserByUserId**
    // **@returns** a promise with user with userId
    getUserByUserId(userId: string){
        return this.rest.one('users', userId).get().then(function(user){
            return user;
        });
    }

    // **addUser**
    // **@returns** a promise with status code
    addUser(user){
        return this.restFull.all('users').post(user);
    }

    // **updateUser**
    // **@returns** a promise with status code
    updateUser(userId,user){
        return this.restFull.one('users',userId).customPUT(user);
    }

    // **deleteUser**
    // **@returns** a promise with status code
    deleteUser(userId){
        return this.restFull.one('users', userId).remove();
    }

    // **SaveuserSetting**
    // **@returns** a promise with status code
    saveUserSetting(userId, setting){
        return this.restFull.one('users',userId).customPUT(setting);
    }

    // **getLdapUsers**
    // **@returns** a promise with list of users
    getLdapUsers(){
        return this.rest.all('externalusers').getList().then(function(users){
            return users;
        });
    }

    // **getLdapUsers with page number and pageSize parameters**
    // **@returns** a promise with list of users
    getLdapUsersPage(searchQuery,pageNumber,pageSize){
        return this.rest.one('externalusers').get({
            search: searchQuery,
            pageno: pageNumber,
            pagesize: pageSize
        }).then(function(users){
            return users;
        });
    }
}
