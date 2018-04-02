describe("Unit Component: eventList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event, $filter, $stateParams;

    // Module defined (non-Angular) injectables
    var config, utils, eventStore;

    // Local variables used for testing
    var vm, clock, throttled, intervalSpy, timer, args, getEventListDeferred, eventList, element, count, i, to_date, from_date;

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
            templateHtml = $templateCache.get("/modules/events/event-list/event-list.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _eventStore_, _eventList_) {
            utils = _utils_;
            config = _config_;
            eventStore = _eventStore_;
            eventList = _eventList_;
        });

    });

    beforeEach(function() {
        $state.current.name = "cluster-events";
        $stateParams.clusterId = "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c";
        getEventListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(eventStore, "getEventList").returns(getEventListDeferred.promise);

        clock = sinon.useFakeTimers();
        config.refreshIntervalTime = 120;
    });

    it("Should initialize all the properties", function() {
        vm = $componentController('eventList', { $scope: $scope, $stateParams: $stateParams });
        vm.clusterId = $stateParams.clusterId;

        expect($rootScope.selectedClusterOption).to.be.equal(vm.clusterId);
        expect(vm.eventList).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.true;
        expect(vm.searchDescText).to.be.equal("");
        expect(vm.date).to.deep.equal(eventList.date);
        expect(vm.toDateOptions.format).to.be.equal("dd M yyyy");
        expect(vm.fromDateOptions.format).to.be.equal("dd M yyyy");
        expect(vm.toDateOptions.format).to.be.equal("dd M yyyy");
        expect(vm.toDateOptions.startDate).to.be.equal($filter("date")(eventList.date.fromDate, "dd MMM yyyy"));
        expect(vm.popupFrom.opened).to.be.false;
        expect(vm.popupTo.opened).to.be.false;
    });

    describe("Task List workflows", function() {
        beforeEach(function() {
            vm = $componentController('eventList', { $scope: $scope, $stateParams: $stateParams });
            vm.clusterId = $stateParams.clusterId;
            getEventListDeferred.resolve(eventList.eventList);
            $rootScope.$digest();
        });

        it("Should get list of jobs", function() {
            expect(angular.toJson(vm.eventList)).to.deep.equal(angular.toJson(eventList.eventList));
        });

        it("Should open from date popup", function() {
            vm.openFromDate();
            expect(vm.popupFrom.opened).to.be.true;
        });

        it("Should open To date popup", function() {
            vm.openToDate();
            expect(vm.popupTo.opened).to.be.true;
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

        it("Should filter by created date: if to data and from date is valid and equal", function() {
            vm.date.fromDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            vm.date.toDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(eventList.eventList[1]);
            expect(bool).to.be.false;
        });

        it("Should filter by created date: if to data and from date exist, but invalid", function() {
            vm.date.fromDate = "Thu Feb 10 2018 00:00:00 GMT+0530 (IST)";
            vm.date.toDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(eventList.eventList[0]);
            expect(bool).to.be.false;
            expect(vm.date.toDate).to.be.equal("");
            expect(vm.invalidToDate).to.be.true;
        });

        it("Should filter by created date: if to data and from date is valid", function() {
            vm.date.fromDate = "Tue Jan 16 2018 00:00:00 GMT+0530 (IST)";
            vm.date.toDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(eventList.eventList[1]);
            expect(bool).to.be.true;
            expect(vm.invalidToDate).to.be.false;
        });

        it("Should filter by created date: if to data is valid", function() {
            vm.date.toDate = "Thu Feb 10 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(eventList.eventList[0]);
            expect(bool).to.be.true;
        });

        it("Should filter by created date: if from data is valid", function() {
            vm.date.fromDate = "Thu Feb 01 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(eventList.eventList);
            expect(bool).to.be.false;
        });

        it("Should filter by created date: if from data is valid", function() {
            vm.date.fromDate = "Tue Jan 25 2018 00:00:00 GMT+0530 (IST)";
            var bool = vm.filterByCreatedDate(eventList.eventList[1]);
            expect(bool).to.be.false;
        });

        it("Should clear all Filters", function() {
            vm.clearAllFilters();
            expect(vm.date.fromDate).to.be.null;
            expect(vm.date.toDate).to.be.null;
            expect(vm.invalidToDate).to.be.false;
            expect(vm.searchDescText).to.be.equal("");
        });

        it("Should filter the text by search", function() {
            var list = vm.searchByDesc(eventList.eventList);
            expect(list).to.deep.equal(eventList.eventList);
        });

        it("Should filter the text by search", function() {
            vm.searchDescText = "job";
            var list = vm.searchByDesc(eventList.eventList[1]);
            expect(angular.toJson(list)).to.deep.equal(angular.toJson(eventList.searchList[0]));
        });
    });

    it("Should verify for Task API error", function() {
        vm = $componentController("eventList", { $scope: $scope });
        getEventListDeferred.reject("error");
        $rootScope.$digest();

        expect(vm.eventList).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.false;
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });
});