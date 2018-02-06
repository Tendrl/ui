describe("Unit Component: taskList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event, $filter;

    // Module defined (non-Angular) injectables
    var config, utils, taskStore;

    // Local variables used for testing
    var vm, clock, throttled, intervalSpy, timer, args, getJobListDeferred, taskList, element, count, i, to_date, from_date;

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
            templateHtml = $templateCache.get("/modules/tasks/task-list/tasks.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _taskStore_, _taskList_) {
            utils = _utils_;
            config = _config_;
            taskStore = _taskStore_;
            taskList = _taskList_;
        });

    });

    beforeEach(function() {
        $state.current.name = "cluster-tasks";
        getJobListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(taskStore, "getJobList").returns(getJobListDeferred.promise);

        clock = sinon.useFakeTimers();
        config.refreshIntervalTime = 120;
    });

    it("Should initialize all the properties", function() {
        vm = $componentController('tasks', { $scope: $scope });

        expect(vm.isDataLoading).to.be.true;
        expect(vm.flag).to.be.false;
        expect(vm.filterBy).to.be.equal("jobId");
        expect(vm.filterByValue).to.be.equal("Task ID");
        expect(vm.filterPlaceholder).to.be.equal("Task ID");
        expect(vm.tasksStatus).to.be.an("array").that.includes("Processing", "Completed", "Failed");
        expect(vm.taskList).to.be.an("array").that.is.empty;
        expect(vm.date).to.deep.equal(taskList.date);
        expect(vm.toDateOptions.format).to.be.equal("dd M yyyy");
        expect(vm.fromDateOptions.format).to.be.equal("dd M yyyy");
        expect(vm.toDateOptions.format).to.be.equal("dd M yyyy");
        expect(vm.toDateOptions.startDate).to.be.equal($filter("date")(taskList.date.fromDate, "dd MMM yyyy"));
        expect(vm.popupFrom.opened).to.be.false;
        expect(vm.popupTo.opened).to.be.false;
    });

    describe("Task List workflows", function() {
        beforeEach(function() {
            vm = $componentController("tasks", { $scope: $scope });
            getJobListDeferred.resolve(taskList.jobs);
            $rootScope.$digest();
        });

        it("Should get list of jobs", function() {
            expect(angular.toJson(vm.taskList)).to.deep.equal(angular.toJson(taskList.formattedJobs));
        });

        it("Should open from date popup", function() {
            vm.openFromDate();
            expect(vm.popupFrom.opened).to.be.true;
        });

        it("Should open To date popup", function() {
            vm.openToDate();
            expect(vm.popupTo.opened).to.be.true;
        });

        it("Should go to specific task detail page", function() {
            // Exercise SUT
            var task = taskList.formattedJobs[0];
            vm.clusterId = taskList.integrationId;
            vm.goToTaskDetail(task.jobId);
            // Verify result (behavior)
            expect(task.jobId).to.not.equal(null);
            expect($state.go.calledWith("task-detail", { clusterId: taskList.integrationId, taskId: task.jobId })).to.be.true;
        });

        it("Should call the task list API continuosly after a certain interval", function() {

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

        it("Should filter by created date: if to data and from date is valid", function() {
            vm.date.fromDate = "Tue Jan 16 2018 00:00:00 GMT+0530 (IST)";
            vm.date.toDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(taskList.formattedJobs);
            expect(bool).to.be.false;
        });

        it("Should filter by created date: if to data is valid", function() {
            vm.date.toDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(taskList.formattedJobs);
            expect(bool).to.be.false;
        });

        it("Should filter by created date: if from data is valid", function() {
            vm.date.fromDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(taskList.formattedJobs);
            expect(bool).to.be.false;
        });

        it("Should filter by created date: if from data is valid", function() {
            var list = vm.filterByCreatedDate(taskList.formattedJobs);
            expect(list).to.deep.equal(taskList.formattedJobs);
        });

        it("Should clear all filters", function() {
            vm.clearAllFilters();

            expect(vm.date.fromDate).to.be.null;
            expect(vm.date.toDate).to.be.null;
            expect(vm.invalidToDate).to.be.false;
            expect(vm.filterBy).to.be.equal("jobId");
            expect(vm.filterByValue).to.be.equal("Task ID");
            expect(vm.filterPlaceholder).to.be.equal("Task ID");
            expect(vm.searchBy).to.be.empty;
            expect(vm.tasksStatus).to.be.an("array").that.includes("Processing", "Completed", "Failed");
        });

    });
});