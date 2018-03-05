describe("Unit Component: clusterList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event;

    // Module defined (non-Angular) injectables
    var config, utils, clusterList, Notifications, clusterStore;

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

        inject(function(_$q_, _$componentController_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _$interval_, _$uibModal_) {
            $q = _$q_;
            $componentController = _$componentController_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $interval = _$interval_;
            $uibModal = _$uibModal_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/cluster-list/cluster-list.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _clusterStore_, _Notifications_, _clusterList_) {
            utils = _utils_;
            config = _config_;
            clusterList = _clusterList_;
            clusterStore = _clusterStore_;
            Notifications = _Notifications_;
        });

    });

    beforeEach(function() {

        $rootScope.clusterData = clusterList;
        $state.current.name = "cluster";
        getClusterListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(clusterStore, "getClusterList").returns(getClusterListDeferred.promise);
        sinon.stub(clusterStore, "formatClusterData").returns(clusterList.formattedOutput);
        sinon.stub(utils, "redirectToGrafana")

        clock = sinon.useFakeTimers();
        config.refreshIntervalTime = 120;

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("clusterList", { $scope: $scope });

        expect(vm.isDataLoading).to.be.true;
        expect(vm.clusterNotPresent).to.be.false;
        expect(vm.flag).to.be.false;
        expect($rootScope.selectedClusterOption).to.be.equal("allClusters");
        expect(vm.filtersText).to.be.equal("");
        expect(vm.filters).to.be.an("array").that.is.empty;
        expect(vm.clusterList).to.be.an("array").that.is.empty;
        expect(vm.filteredClusterList).to.be.an("array").that.is.empty;
        expect(vm.sortConfig.fields).to.deep.equal(clusterList.fields);
        expect(vm.sortConfig.onSortChange).to.be.a("function");
        expect(clusterStore.selectedTab).to.be.equal(1);
    });

    describe("Cluster List workflows", function() {
        beforeEach(function() {
            vm = $componentController("clusterList", { $scope: $scope });
            getClusterListDeferred.resolve(clusterList.clusters);
            $rootScope.$digest();
        });

        it("Should get list of clusters", function() {
            expect(vm.clusterList).to.deep.equal(clusterList.formattedOutput);
        });

        it("Should take the user to dashboard on clicking Dashboard button", function() {
            // Exercise SUT
            var cluster = clusterList.formattedOutput[0];
            vm.redirectToGrafana(cluster);

            // Verify result (behavior)
            expect(utils.redirectToGrafana.calledWith("glance", undefined, { clusterId: cluster.clusterId })).to.be.true;
        });

        /*it("Should enable/disable profiling on clicking Enable/Disable profiling link", function() {
            // Exercise SUT
            var cluster = clusterList.formattedOutput[0],
                profilingDeferred = $q.defer(),
                event = new Event("click");

            sinon.stub(clusterStore, "doProfilingAction").returns(profilingDeferred.promise);
            sinon.stub(Notifications, "message");
            sinon.stub(event, "stopPropagation");

            vm.doProfilingAction(event, cluster, "Enable", cluster.clusterId);

            expect(vm.profilingButtonClick).to.be.true;

            profilingDeferred.resolve(clusterList.profilingResponse);
            $rootScope.$digest();

            // Verify result (behavior)
            expect(vm.profilingButtonClick).to.be.false;
            expect(Notifications.message.calledWith("success", "", "Volume profiling enabled successfully.")).to.be.true;
            expect(vm.clusterList[0].isProfilingEnabled).to.be.equal("Enabled");
            expect(event.stopPropagation.calledOnce).to.be.true;
        });WIP*/

        it("Should open modal to see error logs in case of import failure", function() {
            var cluster = clusterList.formattedOutput[1],
                fakeResult = {
                    result: $q.resolve()
                };

            sinon.stub($uibModal, "open").returns(fakeResult);

            vm.openErrorModal(cluster);

            expect($uibModal.open.calledOnce).to.be.true;
        });

        it("Should set the flag by addTooltip", function() {
            // Exercise SUT
            sinon.stub(utils, "tooltip").returns(true);
            vm.addTooltip();

            //Verify result (behavior)
            expect(vm.flag).to.be.true;
        });

        it("Should call the cluster list API continuosly after a certain interval", function() {

            intervalSpy = sinon.spy($interval);
            throttled = throttle(intervalSpy);

            throttled();

            clock.tick(1000 * config.refreshIntervalTime - 1);
            expect(intervalSpy.notCalled).to.be.true;

            clock.tick(1);
            expect(intervalSpy.called).to.be.true;

            expect(new Date().getTime()).to.be.equal(1000 * config.refreshIntervalTime);

            function throttle(callback) {

                return function() {

                    clearTimeout(timer);
                    args = [].slice.call(arguments);

                    timer = setTimeout(function() {
                        callback.apply(this, args);
                    }, 1000 * config.refreshIntervalTime);
                };
            }
        });

        it("Should cancel the timer", function() {
            sinon.stub($interval, "cancel");
            $scope.$destroy();

            expect($interval.cancel.calledOnce).to.be.true;
        });

        it("Should listen GotClusterData event broadcast", function() {

            $rootScope.clusterData = null;
            $scope.$broadcast("GotClusterData");
            expect(vm.clusterNotPresent).to.be.true;

            $rootScope.clusterData = [];
            $scope.$broadcast("GotClusterData");
            expect(vm.clusterNotPresent).to.be.true;

            vm.clusterNotPresent = false;
            $rootScope.clusterData = ["cluster1"];
            $scope.$broadcast("GotClusterData");
            expect(vm.clusterNotPresent).to.be.false;
        });
    });

    it("Should sort the list with changed parameters", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        vm.sortConfig.currentField = {
            id: "status",
            title: "Status",
            sortType: "alpha"
        };
        vm.sortConfig.isAscending = false;
        getClusterListDeferred.resolve(clusterList.clusters);
        $rootScope.$digest();
        expect(vm.clusterList).to.deep.equal(clusterList.sortedformattedOutput);
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });

});
