describe("Unit Component: clusterVolumes", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $stateParams, $componentController;

    // Module defined (non-Angular) injectables
    var config, utils, clusterVolumes, Notifications, clusterStore;

    // Local variables used for testing
    var getClusterListDeferred, vm, clock, throttled, intervalSpy, timer, args, dashboardStub, element;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$componentController_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _$stateParams_) {
            $q = _$q_;
            $componentController = _$componentController_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $stateParams = _$stateParams_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/cluster-volumes/cluster-volumes.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_clusterStore_, _clusterVolumes_) {
            clusterVolumes = _clusterVolumes_;
            clusterStore = _clusterStore_;
        });

    });

    beforeEach(function() {
        $stateParams.clusterId = clusterVolumes.clusters[0].clusterId;
        $state.current.name = "cluster-volumes";
        getClusterListDeferred = $q.defer();

        sinon.stub(clusterStore, "getClusterList").returns(getClusterListDeferred.promise);
        sinon.stub(clusterStore, "getClusterDetails").returns(clusterVolumes.clusters[0]);

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("clusterVolumes", { $scope: $scope });

        expect(vm.isDataLoading).to.be.true;
        expect(vm.clusterId).to.be.equal("e372c01c-5022-41ce-9412-e96038bca305");
        expect($rootScope.selectedClusterOption).to.be.equal("e372c01c-5022-41ce-9412-e96038bca305");
    });

    it("Should call getClusterList if clusterData doens't exit", function() {
        vm = $componentController("clusterVolumes", { $scope: $scope });
        getClusterListDeferred.resolve(clusterVolumes.clusters);
        $rootScope.$digest();

        expect(vm.isDataLoading).to.be.false;
        expect(vm.clusterObj).to.deep.equal(clusterVolumes.clusters[0]);
        expect(vm.clusterName).to.be.equal(clusterVolumes.clusters[0].clusterId);
    });

    it("Should not call getClusterList if clusterData exists", function() {
        $rootScope.clusterData = clusterVolumes.clusters;
        vm = $componentController("clusterVolumes", { $scope: $scope });

        expect(vm.isDataLoading).to.be.false;
        expect(vm.clusterObj).to.deep.equal(clusterVolumes.clusters[0]);
        expect(vm.clusterName).to.be.equal(clusterVolumes.clusters[0].clusterId);

    });

    it("Should listen GotClusterData event broadcast", function() {

        vm = $componentController("clusterVolumes", { $scope: $scope });
        getClusterListDeferred.resolve(clusterVolumes.clusters);
        $rootScope.$digest();

        $rootScope.clusterData = clusterVolumes.clusters;
        $scope.$broadcast("GotClusterData");
        expect($rootScope.selectedClusterOption).to.be.equal(clusterVolumes.clusters[0].clusterId);
    });

    afterEach(function() {
        // Tear down
        clusterStore.getClusterList.restore();
        clusterStore.getClusterDetails.restore();
    });

});
