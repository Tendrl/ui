/// <reference path="../../../typings/tsd.d.ts" />

export class UserService {
    rest: restangular.IService;
    restFull: restangular.IService;
    currentUser: string;
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
        return this.currentUser;
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

    // **editUser**
    // **@returns** a promise with status code
    editUser(userId,user){
        return this.restFull.one('users',userId).customPUT(user);
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
}
