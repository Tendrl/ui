(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("volumeController", volumeController);

    /*@ngInject*/
    function volumeController(utils, config, $state) {
        var vm = this;

        vm.performAction = performAction;

        utils.getVolumeList(config.clusterId).then(function(list) {
            vm.volumeList = list;
        });            

        utils.getActionList(config.clusterId, "volume").then(function(list) {
              vm.actionList = list;
        });

        function performAction(action, actionName) {
            if(actionName === "create") {
                utils.setActionDetails(action, actionName);
	    		$state.go("create-volume");
	    	}
        }
    }

})();
