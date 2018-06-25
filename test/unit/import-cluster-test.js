describe("Unit Component: importCluster", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event, $stateParams;

    // Module defined (non-Angular) injectables
    var config, utils, importCluster, Notifications, clusterStore;

    // Local variables used for testing
    var getClusterDeferred, importClusterDeferred, vm, clock, throttled, intervalSpy, timer, args, element;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$componentController_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _$interval_, _$uibModal_, _$stateParams_) {
            $q = _$q_;
            $componentController = _$componentController_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $interval = _$interval_;
            $uibModal = _$uibModal_;
            $stateParams = _$stateParams_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/clusters/import-cluster/import-cluster.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _clusterStore_, _Notifications_, _importCluster_) {
            utils = _utils_;
            config = _config_;
            clusterStore = _clusterStore_;
            Notifications = _Notifications_;
            importCluster = _importCluster_;
        });

    });

    beforeEach(function() {

        $rootScope.clusterData = importCluster.formattedOutput;
        $state.current.name = "import-cluster";
        $stateParams.clusterId = importCluster.formattedOutput[0].clusterId;
        getClusterDeferred = $q.defer();
        importClusterDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(clusterStore, "getCluster").returns(getClusterDeferred.promise);
        sinon.stub(clusterStore, "importCluster").returns(importClusterDeferred.promise);

        clock = sinon.useFakeTimers();
        config.refreshIntervalTime = 10;

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("importCluster", { $scope: $scope });

        expect(vm.filtersText).to.be.equal("");
        expect(vm.enableProfiling).to.be.equal("enable");
        expect(vm.taskInitiated).to.be.false;
        expect(vm.importIcon).to.be.false;
        expect(vm.failedImport).to.be.false;
        expect(vm.filters).to.be.an("array").that.is.empty;
        expect(vm.jobId).to.be.equal("");
        expect(vm.filterConfig.fields).to.deep.equal(importCluster.filterFields);
        expect(vm.filterConfig.onFilterChange).to.be.a("function");
        expect(vm.filterConfig.appliedFilters).to.be.an("array").that.is.empty;
        expect(vm.tableConfig).to.deep.equal(importCluster.tableConfig);
        expect(vm.tableColumns).to.deep.equal(importCluster.tableColumns);
    });


    describe("Import Cluster workflows", function() {
        beforeEach(function() {
            vm = $componentController("importCluster", { $scope: $scope });
            getClusterDeferred.resolve(importCluster.clusters[0]);
            $rootScope.$digest();
        });

        it("Should initiate importing cluster", function() {

            vm.importCluster();
            importClusterDeferred.resolve(importCluster.data);
            $rootScope.$digest();

            expect(vm.importIcon).to.be.true;
            expect(vm.taskInitiated).to.be.true;
            expect(vm.jobId).to.be.equal(importCluster.data.job_id);
        });

        it("Should not initiate importing cluster", function() {

            sinon.stub(Notifications, "message");
            vm.importCluster();
            importClusterDeferred.reject("error");
            $rootScope.$digest();

            expect(vm.importIcon).to.be.false;
            expect(vm.taskInitiated).to.be.false;
            expect(Notifications.message.calledWith("danger", "", "Failed to initaite import.")).to.be.true;
        });

        it("Should take you to clusters state", function() {
            vm.importCancel();
            expect($state.go.calledWith("clusters"));
        });

        it("Should take you to task detail state", function() {
            vm.clusterId = importCluster.formattedOutput[0].clusterId;
            vm.jobId = importCluster.data.job_id;
            vm.viewTaskProgress();
            expect($state.go.calledWith("global-task-detail",{clusterId: vm.clusterId, taskId: vm.jobId }));
        });
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
        clusterStore.getCluster.restore();
        clusterStore.importCluster.restore();
    });

});