describe("Unit Component: TaskDetailList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event, $filter, $stateParams;

    // Module defined (non-Angular) injectables
    var config, utils, taskStore, clusterStore, taskDetail;

    // Local variables used for testing
    var vm, clock, throttled, intervalSpy, timer, args, getClusterListDeferred, getJobDetailDeferred, getLogsListDeferred, getTaskStatusDeferred, getClusterDetailDeferred, element, count, i;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$componentController_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _$interval_, _$uibModal_, _$filter_, _$stateParams_) {
            $q = _$q_;
            $componentController = _$componentController_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $interval = _$interval_;
            $uibModal = _$uibModal_;
            $filter = _$filter_;
            $stateParams = _$stateParams_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/tasks/task-detail/task-detail.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _taskStore_, _clusterStore_, _taskDetail_) {
            utils = _utils_;
            config = _config_;
            taskStore = _taskStore_;
            clusterStore = _clusterStore_;
            taskDetail = _taskDetail_;
        });

    });

    beforeEach(function() {
        $rootScope.clusterData = taskDetail.clusterList;
        $state.current.name = "task-detail";
        $stateParams.clusterId = "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c";
        getClusterListDeferred = $q.defer();
        getJobDetailDeferred = $q.defer();
        getLogsListDeferred = $q.defer();
        getTaskStatusDeferred = $q.defer();
        getClusterDetailDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(clusterStore, "getClusterList").returns(getClusterListDeferred.promise);
        sinon.stub(taskStore, "getJobDetail").returns(getJobDetailDeferred.promise);
        sinon.stub(taskStore, "getTaskLogs").returns(getLogsListDeferred.promise);
        sinon.stub(taskStore, "getTaskStatus").returns(getTaskStatusDeferred.promise);
        sinon.stub(clusterStore, "getClusterDetails").returns(taskDetail.clusterList[0]);

        clock = sinon.useFakeTimers();
        config.msgRefreshIntervalTime = 5;
    });

    it("Should initialize all the properties", function() {
        vm = $componentController('taskDetail', { $scope: $scope, $stateParams: $stateParams });
        vm.clusterId = $stateParams.clusterId;

        expect($rootScope.selectedClusterOption).to.be.equal(taskDetail.clusterList[0].integrationId);
        expect(vm.isDataLoading).to.be.true;
        expect(vm.isMessagesLoading).to.be.true;
        expect(vm.taskDetail).to.be.an("array").that.is.empty;
    });

    describe("Task List workflows", function() {
        beforeEach(function() {
            vm = $componentController("taskDetail", { $scope: $scope, $stateParams: $stateParams });
            getJobDetailDeferred.resolve(taskDetail.jobDetail);
            getLogsListDeferred.resolve(taskDetail.logs);
            getTaskStatusDeferred.resolve(taskDetail.status);
            getClusterDetailDeferred.resolve(taskDetail.clusterList[0]);
            $rootScope.$digest();
        });

        it("Should fetch job details and logs", function() {
            expect($rootScope.clusterData).to.deep.equal(taskDetail.clusterList);
            expect(vm.clusterObj).to.deep.equal(taskDetail.clusterList[0]);
            expect(vm.clusterName).to.be.equal(taskDetail.clusterList[0].clusterId);
            expect(vm.clusterStatus).to.be.equal(taskDetail.clusterList[0].status);
            expect(vm.taskDetail).to.deep.equal(taskDetail.jobDetail);
            expect(vm.isDataLoading).to.be.false;
            expect(vm.taskDetail.logs).to.deep.equal(taskDetail.logs);
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

        it("Should go to cluster task view", function(){
            vm.goToClusterTask();
            expect($state.go.calledWith("cluster-tasks", { clusterId: vm.clusterId }));
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