(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("utilisationChart", {
            bindings: {
                used: "=",
                total: "="
            },
            controllerAs: "vm",
            controller: utilisationChartController,
            templateUrl: "/commons/components/utilisation-chart/utilisation-chart.html"
        });

    function utilisationChartController($element, $scope) {
        var vm = this;
    };
}());
