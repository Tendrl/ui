describe("Unit Controller: clusterController", function () {
    "use strict";

    // Angular injectables
    var $q, $httpBackend, $injector, $controller, $rootScope, $state, $location, $templateCache, $compile;

    // Module defined (non-Angular) injectables
    var $scope, config, utils, clusterList;

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

        inject(function (_$q_, _$controller_, _$rootScope_, _$state_, _$location_, _$templateCache_, _$compile_, _clusterList_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            clusterList = _clusterList_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/cluster.html");

            $compile(templateHtml)($scope);
        });

        inject(function (_utils_) {
            utils = _utils_;
        });
    });

    beforeEach(function () {

        getListDeferred = $q.defer();
        sinon.stub(utils, "getObjectList").returns(getListDeferred.promise);

        $state.current.name = "cluster";

        vm = $controller("clusterController", { $scope: $scope });

    });

    it("Should get list of clusters", function() {
        getListDeferred.resolve(clusterList.list);
        $scope.$digest();
        expect(vm.clusterList).to.deep.equal(clusterList.list);
    });

});