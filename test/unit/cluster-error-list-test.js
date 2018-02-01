describe("Unit Controller: errorListController", function() {
    "use strict";

    // Angular injectables
    var $scope, $injector, $rootScope, $state, $templateCache, $compile, $controller;

    // Local variables used for testing
    var vm, templateHtml, element;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$rootScope_, _$state_, _$templateCache_, _$compile_, _$controller_) {
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $controller = _$controller_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/cluster-error-list/cluster-error-list.html");

            element = $compile(templateHtml)($scope);
        });

    });

    beforeEach(function() {

        sinon.stub($rootScope, "$emit");
        vm = $controller("errorListController", { $scope: $scope, cluster: {} });
    });

    it("Should initialize all the properties", function() {

        expect(vm.modalHeader).to.deep.equal({
            "title": "Import Failed",
            "close": vm.closeModal
        });
        expect(vm.modalFooter).to.deep.equal([{
            "name": "Close",
            "type": "button",
            "classname": "btn-primary",
            "onCall": vm.closeModal
        }]);
    });

    it("Should call $rootScope.$event", function() {
        vm.closeModal();

        expect($rootScope.$emit.calledOnce).to.be.true;
    });
    afterEach(function() {
        // Tear down
        $rootScope.$emit.restore();
    });

});
