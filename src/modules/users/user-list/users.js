(function() {
	"use strict";

	angular
		.module("TendrlModule")
		.component("users",{

			restrict: "E",
			templateUrl: "/modules/users/user-list/users.html",
			bindings: {},
			controller: userController,
			controllerAs: "userCntrl"
		});

	/*@ngInject*/
	function userController($rootscope, $scope, $interval, $state, $timeout, $filter, orderByFilter, config, userStore) {

		var vm = this,
			userTimer;

		//vm.userStatus = [];
		vm.isDataLoading = true;

		init();

		function init() {
			userStore.getUserList()
				.then(function(data){
					vm.userList = data;
					vm.isDataLoading = false;
					startTimer();
				});
		}

		function startTimer() {

			userTimer = $interval(function() {

				userStore.getUserList()
					.then(function(data){
						$interval.cancel(userTimer);
						vm.userList = data;
						vm.isDataLoading = false;
						startTimer();
					});
			}, 1000 * config.statusRefreshIntervalTime, 1);
		}

		function setupUserListData(list){
			var i,
				j,
				length = list.length,
				userList = [],
				index,
				user;

			for (i =0; i<length ;i++){
				user = {};
				user.username = list[i].username;
				user.firstName = userStore.generateName(list[i].name).firstName;
				user.lastName = userStore.generateName(list[i].name).lastName;
				if(list[i].status){
					user.status = 'Enabled';
				} else {
					user.status = 'Disabled';
				}
				user.role = list[i].role;
				if(list[i].notification){
					user.notification = 'Enabled';
				} else {
					user.notification = 'Disabled';
				}
				user.email = list[i].email;

				userList.push(user);
			}
			return userList;
		}

		/*Cancelling interval when scope is destroy*/
		$scope.$on('$destroy', function(){
			$interval.cancel(userTimer);
		})



	}

})();