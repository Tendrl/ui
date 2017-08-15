(function(){
	"use strict";

	angular
		.module("TendrlModule")
		.service("userStore", userStore);

	/*@ngInject*/
	function userStore($state, $q, utils) {
		var store = this;

		store.getUserList = function() {
			var list,
				deffered;

			deffered = $q.defer();
			utils.getUserList()
				.then(function(data) {
					deffered.resolve(data);
				});

				return deffered.promise;
		};


		store.generateName = function(name) {
				var userName = [],
					temp1 = [],
					temp2,
					i,
					len = name.length;

				for (i = 0; i <len; i++) {
					temp1 = name[i].split(" ");
					temp2 = {};
					temp2.firstName = temp1[0];
					temp2.lastName = temp1[1];
					userName.push(temp2)
				}
					return userName;
			}

			

	}
})();