(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("volumeController", volumeController);

    /*@ngInject*/
    function volumeController($scope, $rootScope, $state, actionListService) {
        var vm = this;

        vm.performAction = performAction;
        vm.volumeList = [
        		{volname: "vol1", state: 2, status: 0, cluster_name: "Gluster1"},
        		{volname: "vol2", state: 2, status: 0, cluster_name: "Gluster1"}
        ];
        actionListService.getActionList('f82409b8-b5ba-4f91-8486-e0294193268e', 'volume').then(function(list) {
              vm.actionList = list;  
        });
        function performAction(action) {
            if(action === 'create') {
	    		$state.go("create-volume");
	    	}
        }
    }

})();
