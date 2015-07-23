/// <reference path="../../../typings/tsd.d.ts" />

export class RouteConfig {
	static $inject: Array<string> = ['$routeProvider'];
	constructor(private routeProvider: ng.route.IRouteProvider) {
		routeProvider.when('/', {
			templateUrl: 'views/login.html',
			menuId: 'login',
			controller: 'LoginController',
		}).when('/dashboard', {
			templateUrl: 'views/dashboard.html',
			menuId: 'dashboard',
			controller: 'DashboardController',
			controllerAs: 'dash'
		}).when('/first', {
			templateUrl: 'views/first.html',
			menuId: '',
			controller: 'FirstTimeController',
			controllerAs: 'first'
		}).when('/clusters', {
			templateUrl: 'views/clusters/clusters.html',
			menuId: 'clusters',
			controller: 'ClusterController',
		}).when('/clusters/new', {
			templateUrl: 'views/clusters-new.html',
			menuId: 'clusters',
			controller: 'ClusterNewController',
			controllerAs: 'cluster'
		}).when('/clusters/expand/:id', {
			templateUrl: 'views/clusters-expand.html',
			menuId: 'clusters',
			controller: 'ClusterExpandController',
			controllerAs: 'cluster'
		}).when('/clusters/detail/:id', {
			templateUrl: 'views/clusters-detail.html',
			menuId: '',
			controller: 'ClusterDetailController',
			controllerAs: 'clusterdetail'
		}).when('/hosts', {
			templateUrl: 'views/hosts.html',
			menuId: 'hosts',
			controller: 'HostController',
			controllerAs: 'hosts'
		}).when('/hosts/detail/:id', {
			templateUrl: 'views/hosts-detail.html',
			menuId: '',
			controller: 'HostDetailController',
			controllerAs: 'hostdetail'
		}).when('/volumes', {
			templateUrl: 'views/volumes.html',
			menuId: 'storage',
			controller: 'VolumeController',
			controllerAs: 'volumes'
		}).when('/volumes/new', {
			templateUrl: 'views/volumes-new.html',
			menuId: 'storage',
			controller: 'VolumeNewController',
			controllerAs: 'volume'
		}).when('/volumes/expand/:id', {
			templateUrl: 'views/volumes-expand.html',
			menuId: 'storage',
			controller: 'VolumeExpandController',
			controllerAs: 'volume'
		}).when('/volumes/detail/:id', {
			templateUrl: 'views/volumes-detail.html',
			menuId: '',
			controller: 'VolumeDetailController',
			controllerAs: 'volumedetail'
		}).when('/pools', {
			templateUrl: 'views/pools.html',
			menuId: 'storage',
			controller: 'PoolController',
			controllerAs: 'pools'
		}).when('/pools/new', {
			templateUrl: 'views/pools-new.html',
			menuId: 'storage',
			controller: 'PoolNewController',
			controllerAs: 'pool'
		}).otherwise({
			redirectTo: '/'
		});
	}
}