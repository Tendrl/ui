describe("UNIT CONTROLLER - importClusterController", function () {
    "use strict";

    // Angular injectables
    var $q, $injector, $controller, $rootScope, $state, $location, $stateParams, $timeout, $templateCache, $compile;

    // Module defined (non-Angular) injectables
    var $scope, utils, config, importCluster;

    // Local variables used for testing
    var getClusterImportDeferred, vm;

    // Initialize modules
    beforeEach(function () {
        module("TendrlModule");
        module("templates");
        module("TestDataModule");
    });

    // Define all injectables and compile template
    beforeEach(function () {

        var templateHtml;

        inject(function (_$q_, _$controller_, _$rootScope_, _$state_, _$stateParams_, _$templateCache_, _$compile_, _importCluster_, _$location_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            importCluster = _importCluster_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/import-cluster/import-cluster.html");

            $compile(templateHtml)($scope);
        });

        inject(function (_utils_, _config_) {
            utils = _utils_;
            config = _config_;
        });
    });

    // Create controller instance to be used by all the unit tests
    beforeEach(function () {

        getClusterImportDeferred = $q.defer();

        sinon.stub(utils, "getClusterImportFlow").returns(getClusterImportDeferred.promise);
        config.baseUrl = "https://localhost:8080/";

        goTo("import-cluster");
        $state.current.name = "import-cluster";

        // Exercise SUT
        vm = $controller("importClusterController", {
            $scope: $scope
        });

    });

    describe("Initialization Block", function () {

        // Verify result (behavior)
        it("Should set the initialization properties", function () {
            expect(vm.isShowImportButton).to.be.true;
            expect(vm.heading).to.be.equal("Import Cluster");
            expect(vm.notification).to.be.empty;
            expect(vm.importFlows).to.be.empty;        
            expect(vm.formAttributes).to.deep.equal({data: {}, isEmpty: true});
        });

        it("Should call getClusterImportFlow", function() {
            expect(utils.getClusterImportFlow.calledOnce).to.be.true;
        });

        it("Should set importFlows", function() {
            getClusterImportDeferred.resolve(importCluster.generateFlows);
            $scope.$digest();
            expect(vm.importFlows).to.deep.equal(importCluster.generateFlows);
        });

    });

    describe("Funtcion: setImportClusterInfo", function () {

        beforeEach(function () {
            vm.setImportClusterInfo(importCluster.flowInfo);
        });

        it("Should set flow details", function () {
            expect(vm.heading).to.be.equal("CephImportCluster");
            expect(vm.isShowImportButton).to.be.false;
            expect(vm.postUrl).to.be.equal("https://localhost:8080/CephImportCluster");
            expect(vm.formAttributes.data).to.deep.equal(importCluster.attributes);
            expect(vm.formAttributes.isEmpty).to.be.false;
        });
    });

    describe("Funtcion: closeNotification", function () {

        beforeEach(function () {
            vm.closeNotification();
        });

        it("Should set notification to empty when notification window is closed", function() {
            expect(vm.notification).to.be.equal("");
        });
    });

    describe("Funtcion: callBack", function () {

        beforeEach(function () {
            vm.callBack({job_id: 1234, status: "in progress"});
        });

        it("Should set notification to empty when notification window is closed", function() {
            expect(vm.notification).to.be.equal("Cluster is imported successfully. and JOB-ID is - 1234 And Cluster import is in progress");
        });
    });

    afterEach(function () {
        // Tear down
        utils.getClusterImportFlow.restore();
    });

    function goTo(url) {
        $location.url(url);
        $rootScope.$digest();
    }
});