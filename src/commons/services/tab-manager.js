(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("tabManager", tabManager);

    /*@ngInject*/
    function tabManager($state) {

        /* Cache the reference to this pointer */
        var vm = this,
            activeTab = 1;

        var tabInfo = [{
            number: 1,
            title: "Volume",
            state: "volume"
        }];

        vm.setActiveTab = function(tabNo) {
            activeTab = tabNo;
            //$state.go("volume");
        };

        vm.getActiveTab = function() {
            return activeTab;
        };
        
    }

})();
