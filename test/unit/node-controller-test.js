describe("Unit Controller: nodeController", function () {
    "use strict";

    // Angular injectables
    var $q, $httpBackend, $injector, $controller, $rootScope, $state, $location, $templateCache, $compile;

    // Module defined (non-Angular) injectables
    var $scope, config, utils, nodeList;

    // Local variables used for testing
    var getListDeferred, vm;

    // Initialize modules
    beforeEach(function () {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function () {

        var templateHtml;

        inject(function (_$q_, _$controller_, _$rootScope_, _$state_, $location, _$templateCache_, _$compile_, _nodeList_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            nodeList = _nodeList_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/node/node.html");

            $compile(templateHtml)($scope);
        });

        inject(function (_utils_) {
            utils = _utils_;
        });
    });

    beforeEach(function () {

        getListDeferred = $q.defer();
        sinon.stub(utils, "getObjectList").returns(getListDeferred.promise);

        $state.current.name = "node";

        vm = $controller("nodeController", { $scope: $scope });

    });

    it("Should get list of nodes", function() {
        getListDeferred.resolve(nodeList.list);
        $scope.$digest();
        expect(vm.nodeList).to.deep.equal(nodeList.list);
    });

});