/*
    ============= How to use "progressBar" component ======
            
    - progressData :  expected array for progressData
    Example: 
    in html file :
    <progress-bar progress-data="createRBDCntrl.progressBarData"><progress-bar>

    in your controller :

    vm.progressBarData = [
        {'value': 10 , 'color': '#A9A9A9', 'name': 'used'},
        {'value': 30 , 'color': '#ADD8E6', 'name': 'added'},
        {'value': 60 , 'color': '#ffffff', 'name': 'remaining'},
    ];


*/
(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    app.controller("progressBarController", progressBarController);

    app.component("progressBar", {
            bindings: {
                progressData: "="
            },
            controllerAs: "vm",
            controller: "progressBarController",
            templateUrl: "/commons/components/progress-bar/progress-bar.html"
        }
    );

    /*@ngInject*/
    function progressBarController() {
        var vm = this, i, total = 0, len = vm.progressData.length;
        
        for(i = 0 ; i < len ; i++) {
            total = total + parseInt(vm.progressData[i].value);
        }
        
        vm.getStyle = function(index) {
            return { width : ( (100/ total ) * parseInt(vm.progressData[index].value))+"%" , background: vm.progressData[index].color}
        }
    }

}());
