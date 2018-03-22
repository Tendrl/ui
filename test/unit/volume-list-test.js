describe("Unit Component: volumeList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $componentController, $event;

    // Module defined (non-Angular) injectables
    var config, utils, volumeStore, volumeList, capitalizeFilter;

    // Local variables used for testing
    var getVolumeListDeferred, vm, clock, throttled, intervalSpy, timer, args, dashboardStub, element;

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

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/volumes/volume-list/volume-list.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _volumeStore_, _volumeList_, _capitalizeFilter_) {
            utils = _utils_;
            config = _config_;
            volumeStore = _volumeStore_;
            volumeList = _volumeList_;
            capitalizeFilter = _capitalizeFilter_;
        });

    });

    beforeEach(function() {


        $state.current.name = "cluster-volumes";
        getVolumeListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(volumeStore, "getVolumeList").returns(getVolumeListDeferred.promise);
        sinon.stub(utils, "redirectToGrafana")

        clock = sinon.useFakeTimers();
        config.volumeRefreshInterval = 10;

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("volumeList", { $scope: $scope });

        expect(vm.isDataLoading).to.be.true;
        expect(vm.flag).to.be.false;
        expect(vm.volumeList).to.be.an("array").that.is.empty;
        expect(vm.filteredVolumeList).to.be.an("array").that.is.empty;
        expect(vm.filtersText).to.be.equal("");
        expect(vm.filters).to.be.an("array").that.is.empty;
        expect(vm.sortConfig.fields).to.deep.equal(volumeList.sortFields);
        expect(vm.sortConfig.onSortChange).to.be.a("function");
        expect(vm.filterConfig.fields).to.deep.equal(volumeList.filterFields);
        expect(vm.filterConfig.onFilterChange).to.be.a("function");
        expect(vm.filterConfig.appliedFilters).to.be.an("array").that.is.empty;
    });

    describe("Volume List workflows", function() {
        beforeEach(function() {
            vm = $componentController("volumeList", { $scope: $scope });
            vm.clusterId = "d139e643-62c3-4520-b79a-ce7cb8babb1f";
            getVolumeListDeferred.resolve(volumeList.volumes);
            $rootScope.$digest();
        });

        it("Should get list of volumes", function() {
            expect(vm.volumeList).to.deep.equal(volumeList.volumes);
        });

        it("Should take the user to dashboard on clicking Dashboard button", function() {
            // Exercise SUT
            var volume = volumeList.volumes[0];
            vm.redirectToGrafana(volume);

            // Verify result (behavior)
            expect(utils.redirectToGrafana.calledWith("volumes", { clusterId: vm.clusterId, volumeName: volume.name })).to.be.true;
        });

        it("Should enable/disable profiling on clicking Enable/Disable profiling action button", function() {
            // Exercise SUT
            var volume = volumeList.volumes[0],
                profilingDeferred = $q.defer(),
                event = new Event("click");

            sinon.stub(volumeStore, "toggleProfiling").returns(profilingDeferred.promise);
            sinon.stub(event, "stopPropagation");
            sinon.stub($interval, "cancel");

            vm.toggleProfiling(volume, "disable", event);

            profilingDeferred.resolve(volumeList.profilingResponse);
            $rootScope.$digest();

            // Verify result (behavior)
            expect(volume.disableAction).to.be.true;
            expect($interval.cancel.calledOnce).to.be.true;
            expect(event.stopPropagation.calledOnce).to.be.true;
        });

        it("Should set the flag by addTooltip", function() {
            // Exercise SUT
            sinon.stub(utils, "tooltip").returns(true);
            vm.addTooltip();

            //Verify result (behavior)
            expect(vm.flag).to.be.true;
        });

        it("Should call the volume list API continuosly after a certain interval", function() {

            intervalSpy = sinon.spy($interval);
            throttled = throttle(intervalSpy);

            throttled();

            clock.tick(1000 * config.volumeRefreshInterval - 1);
            expect(intervalSpy.notCalled).to.be.true;

            clock.tick(1);
            expect(intervalSpy.called).to.be.true;

            expect(new Date().getTime()).to.be.equal(1000 * config.volumeRefreshInterval);

            function throttle(callback) {

                return function() {

                    clearTimeout(timer);
                    args = [].slice.call(arguments);

                    timer = setTimeout(function() {
                        callback.apply(this, args);
                    }, 1000 * config.volumeRefreshInterval);
                };
            }
        });

        it("Should cancel the timer", function() {
            sinon.stub($interval, "cancel");
            $scope.$destroy();

            expect($interval.cancel.calledOnce).to.be.true;
        });

        it("Should take the user to task detail page", function() {
            var volume = volumeList.volumes[1];
            vm.goToTaskDetail(volume);

            expect($state.go.calledWith("task-detail", { clusterId: vm.clusterId, taskId: volume.currentTask.job_id }));
        });

        it("Should take user to volume detail page", function() {
            var volume = volumeList.volumes[0];
            vm.goToVolumeDetail(volume);
            expect($state.go.calledWith("volume-detail", { clusterId: vm.clusterId, taskId: volume.currentTask.job_id }));
        });

        it("Should show enable button on proper conditions", function() {
            var volume = volumeList.volumes[1];
            expect(vm.showEnableBtn(volume)).to.be.true;

            volume = volumeList.volumes[0];
            expect(vm.showEnableBtn(volume)).to.be.false;
        });

        it("Should show disable button on proper conditions", function() {
            var volume = volumeList.volumes[1];
            expect(vm.showDisableBtn(volume)).to.be.false;

            volume = volumeList.volumes[0];
            expect(vm.showDisableBtn(volume)).to.be.true;
        });

    });

    it("Should verify for volume API error", function() {
        vm = $componentController("volumeList", { $scope: $scope });
        getVolumeListDeferred.reject("error");
        $rootScope.$digest();
        expect(vm.volumeList).to.be.an("array").that.is.empty;
        expect(vm.filteredVolumeList).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.false;
    });

    it("Should sort the list with 'name' parameters", function() {
        vm = $componentController("volumeList", { $scope: $scope });

        vm.sortConfig.currentField = {
            id: "name",
            title: "Name",
            sortType: "alpha"
        };

        vm.sortConfig.isAscending = false;
        getVolumeListDeferred.resolve(volumeList.volumes);
        $rootScope.$digest();
        vm.volumeList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filteredVolumeList).to.deep.equal(volumeList.sortedformattedOutputName);
    });

    it("Should sort the list with 'status' parameters", function() {
        vm = $componentController("volumeList", { $scope: $scope });

        vm.sortConfig.currentField = {
            id: "status",
            title: "Status",
            sortType: "alpha"
        };

        vm.sortConfig.isAscending = false;
        getVolumeListDeferred.resolve(volumeList.volumes);
        $rootScope.$digest();
        vm.volumeList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filteredVolumeList).to.deep.equal(volumeList.sortedformattedOutputStatus);
    });

    it("Should filter the list with 'name' parameters", function() {
        vm = $componentController("volumeList", { $scope: $scope });

        vm.filters = [{
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }];

        vm.filters[0].value = "vol2";
        getVolumeListDeferred.resolve(volumeList.volumes);
        $rootScope.$digest();
        expect(vm.filtersText).to.be.equal("Name : vol2\n");
        vm.volumeList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filteredVolumeList).to.deep.equal(volumeList.filteredNameFormattedOutput);
    });

    it("Should filter the list with 'status' parameters", function() {
        vm = $componentController("volumeList", { $scope: $scope });

        vm.filters = [{
            id: "status",
            title: "Status",
            placeholder: "Filter by Status",
            filterType: "select",
            filterValues: ["Started", "Stopped"]
        }];

        vm.filters[0].value = "Started";
        getVolumeListDeferred.resolve(volumeList.volumes);
        $rootScope.$digest();
        expect(vm.filtersText).to.be.equal("Status : Started\n");
        vm.volumeList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filteredVolumeList).to.deep.equal(volumeList.filteredStatusFormattedOutput);
    });

    it("Should filter the list with 'type' parameters", function() {
        vm = $componentController("volumeList", { $scope: $scope });

        vm.filters = [{
            id: "type",
            title: "Type",
            placeholder: "Filter by Type",
            filterType: "select",
            filterValues: ["Distribute", "Replicated", "Dispersed", "Distributed-Dispersed"]
        }];

        vm.filters[0].value = "Distribute";
        getVolumeListDeferred.resolve(volumeList.volumes);
        $rootScope.$digest();
        expect(vm.filtersText).to.be.equal("Type : Distribute\n");
        vm.volumeList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filteredVolumeList).to.deep.equal(volumeList.filteredTypeFormattedOutput);
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });

});