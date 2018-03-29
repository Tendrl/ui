describe("Unit Component: GlobalTaskDetailList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event, $filter;

    // Module defined (non-Angular) injectables
    var config, utils, taskStore, clusterStore, globalTaskDetail;

    // Local variables used for testing
    var vm, clock, throttled, intervalSpy, timer, args, getClusterListDeferred, getJobDetailDeferred, getLogsListDeferred, getTaskStatusDeferred, element, count, i;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$componentController_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _$interval_, _$uibModal_, _$filter_) {
            $q = _$q_;
            $componentController = _$componentController_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $interval = _$interval_;
            $uibModal = _$uibModal_;
            $filter = _$filter_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/tasks/global-task-detail/global-task-detail.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _taskStore_, _clusterStore_, _globalTaskDetail_) {
            utils = _utils_;
            config = _config_;
            taskStore = _taskStore_;
            clusterStore = _clusterStore_;
            globalTaskDetail = _globalTaskDetail_;
        });

    });

    beforeEach(function() {
        $rootScope.clusterData = globalTaskDetail.clusterList;
        $state.current.name = "global-task-detail";
        getClusterListDeferred = $q.defer();
        getJobDetailDeferred = $q.defer();
        getLogsListDeferred = $q.defer();
        getTaskStatusDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(clusterStore, "getClusterList").returns(getClusterListDeferred.promise);
        sinon.stub(taskStore, "getJobDetail").returns(getJobDetailDeferred.promise);
        sinon.stub(taskStore, "getTaskLogs").returns(getLogsListDeferred.promise);
        sinon.stub(taskStore, "getTaskStatus").returns(getTaskStatusDeferred.promise);
        clock = sinon.useFakeTimers();
        config.msgRefreshIntervalTime = 5;
    });

    it("Should initialize all the properties", function() {
        vm = $componentController('globalTaskDetail', { $scope: $scope });

        expect($rootScope.selectedClusterOption).to.be.equal("");
        expect(vm.clusterId).to.be.equal(globalTaskDetail.clusterList.integrationId);
        expect(vm.isDataLoading).to.be.true;
        expect(vm.isMessagesLoading).to.be.true;
        expect(vm.taskDetail).to.be.an("array").that.is.empty;
    });

    describe("Task List workflows", function() {
        beforeEach(function() {
            vm = $componentController("globalTaskDetail", { $scope: $scope });
            getJobDetailDeferred.resolve(globalTaskDetail.jobDetail);
            getLogsListDeferred.resolve(globalTaskDetail.logs);
            getTaskStatusDeferred.resolve(globalTaskDetail.status);
            $rootScope.$digest();
        });

        it("Should fetch job details and logs", function() {
            expect($rootScope.clusterData).to.deep.equal(globalTaskDetail.clusterList);
            expect(vm.taskDetail).to.deep.equal(globalTaskDetail.jobDetail);
            expect(vm.isDataLoading).to.be.false;
            expect(vm.taskDetail.logs).to.deep.equal(globalTaskDetail.logs);
            expect(vm.isMessagesLoading).to.be.false;
        });

        it("Should call the task list API continuosly after a certain interval", function() {

            intervalSpy = sinon.spy($interval);
            throttled = throttle(intervalSpy);

            throttled();

            clock.tick(1000 * config.msgRefreshIntervalTime - 1);
            expect(intervalSpy.notCalled).to.be.true;

            clock.tick(1);
            expect(intervalSpy.called).to.be.true;

            expect(new Date().getTime()).to.be.equal(1000 * config.msgRefreshIntervalTime);

            function throttle(callback) {

                return function() {

                    clearTimeout(timer);
                    args = [].slice.call(arguments);

                    timer = setTimeout(function() {
                        callback.apply(this, args);
                    }, 1000 * config.msgRefreshIntervalTime);
                };
            }
        });

        it("Should cancel the timer", function() {
            sinon.stub($interval, "cancel");
            $scope.$destroy();
            expect($interval.cancel.calledTwice).to.be.true;
        });

    });

    it("Should verify for API error", function() {
        vm = $componentController("globalTaskDetail", { $scope: $scope });
        getJobDetailDeferred.reject("error");
        $rootScope.$digest();
        expect(vm.taskDetail).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.false;
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });
});