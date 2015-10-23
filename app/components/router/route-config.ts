/// <reference path="../../../typings/tsd.d.ts" />

export class RouteConfig {
	static $inject: Array<string> = ['$routeProvider'];
	constructor(private routeProvider: ng.route.IRouteProvider) {
		routeProvider.when('/', {
			templateUrl: 'views/login/login.html',
			name: '',
			controller: 'LoginController',
			controllerAs: 'login'
		}).when('/dashboard', {
			templateUrl: 'views/dashboard/dashboard.html',
			name: 'dashboard',
			controller: 'DashboardController',
			controllerAs: 'dash'
		}).when('/first', {
			templateUrl: 'views/first/first.html',
			name: '',
			controller: 'FirstController',
			controllerAs: 'first'
		}).when('/clusters', {
			templateUrl: 'views/clusters/clusters.html',
			name: 'clusters',
			controller: 'ClusterController',
            controllerAs: 'clusters'
		}).when('/clusters/new', {
			templateUrl: 'views/clusters/clusters-new.html',
			name: 'clusters',
			controller: 'ClusterNewController',
			controllerAs: 'cluster'
		}).when('/clusters/expand/:id', {
			templateUrl: 'views/clusters/clusters-expand.html',
			name: 'clusters',
			controller: 'ClusterExpandController',
			controllerAs: 'cluster'
		}).when('/clusters/detail/:id', {
			templateUrl: 'views/clusters/clusters-detail.html',
			name: 'clusters',
			controller: 'ClusterDetailController',
			controllerAs: 'clusterdetail'
		}).when('/hosts', {
			templateUrl: 'views/hosts/hosts.html',
			name: 'hosts',
			controller: 'HostController',
			controllerAs: 'hosts'
		}).when('/hosts/detail/:id', {
			templateUrl: 'views/hosts/hosts-detail.html',
			name: 'hosts',
			controller: 'HostDetailController',
			controllerAs: 'hostdetail'
		}).when('/volumes', {
			templateUrl: 'views/volumes/volumes.html',
			name: 'volumes',
			controller: 'VolumeController',
			controllerAs: 'volumes'
		}).when('/volumes/new', {
			templateUrl: 'views/volumes/volumes-new.html',
			name: 'volumes',
			controller: 'VolumeNewController',
			controllerAs: 'volume'
		}).when('/volumes/expand/:id', {
			templateUrl: 'views/volumes/volumes-expand.html',
			name: 'volumes',
			controller: 'VolumeExpandController',
			controllerAs: 'volume'
		}).when('/volumes/detail/:id', {
			templateUrl: 'views/volumes-detail.html',
			name: 'volumes',
			controller: 'VolumeDetailController',
			controllerAs: 'volumedetail'
		}).when('/pools', {
			templateUrl: 'views/pools/pools.html',
			name: 'pools',
			controller: 'PoolController',
			controllerAs: 'pools'
		}).when('/pools/new', {
			templateUrl: 'views/pools/pools-new.html',
			name: 'pools',
			controller: 'PoolNewController',
			controllerAs: 'pool'
		}).when('/admin', {
			templateUrl: 'views/admin/admin.html',
			controller: 'UserController',
			controllerAs: 'users',
			name: 'admin'
		}).when('/admin/new', {
			templateUrl: 'views/admin/add-user.html',
			controller: 'UserNewController',
			controllerAs: 'user',
			name: 'admin'
		}).otherwise({
			redirectTo: '/'
		});
	}
}