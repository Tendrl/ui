describe("Unit Component: hostList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $componentController, $event;

    // Module defined (non-Angular) injectables
    var config, utils, nodeStore, hostList, capitalizeFilter;

    // Local variables used for testing
    var getHostListDeferred, vm, clock, throttled, intervalSpy, timer, args, dashboardStub, element;

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
            templateHtml = $templateCache.get("/modules/hosts/host-list/host-list.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _nodeStore_, _hostList_, _capitalizeFilter_) {
            utils = _utils_;
            config = _config_;
            nodeStore = _nodeStore_;
            hostList = _hostList_;
            capitalizeFilter = _capitalizeFilter_;
        });

    });

    beforeEach(function() {
        $state.current.name = "cluster-hosts";
        getHostListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(nodeStore, "getNodeList").returns(getHostListDeferred.promise);
        sinon.stub(utils, "redirectToGrafana")

        clock = sinon.useFakeTimers();
        config.nodeRefreshInterval = 10;

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("hostList", { $scope: $scope });

        expect(vm.isDataLoading).to.be.true;
        expect(vm.flag).to.be.false;
        expect(vm.filtersText).to.be.equal("");
        expect(vm.hostList).to.be.an("array").that.is.empty;
        expect(vm.filteredHostList).to.be.an("array").that.is.empty;
        expect(vm.filters).to.be.an("array").that.is.empty;
        expect(vm.sortConfig.fields).to.deep.equal(hostList.sortFields);
        expect(vm.sortConfig.onSortChange).to.be.a("function");
        expect(vm.filterConfig.fields).to.deep.equal(hostList.filterFields);
        expect(vm.filterConfig.onFilterChange).to.be.a("function");
        expect(vm.filterConfig.appliedFilters).to.be.an("array").that.is.empty;
    });

    // describe("Host List workflows", function() {
    //     beforeEach(function() {
    //         vm = $componentController("hostList", { $scope: $scope });
    //         vm.clusterId = "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c";
    //         getHostListDeferred.resolve(hostList.nodes);
    //         $rootScope.$digest();
    //     });

    //     it("Should get list of hosts", function() {
    //         expect(vm.hostList).to.deep.equal(hostList.nodes);
    //     });

    //     it("Should take the user to dashboard on clicking Dashboard button", function() {
    //         // Exercise SUT
    //         var host = hostList.nodes[0];
    //         var host_name = host.name.split(".").join("_");
    //         console.log(host_name);
    //         vm.redirectToGrafana(host);

    //         // Verify result (behavior)
    //         expect(utils.redirectToGrafana.calledWith("hosts", undefined, { clusterId: vm.clusterId, hostName: host_name })).to.be.true;
    //     });


    //     it("Should set the flag by addTooltip", function() {
    //         // Exercise SUT
    //         sinon.stub(utils, "tooltip").returns(true);
    //         vm.addTooltip();

    //         //Verify result (behavior)
    //         expect(vm.flag).to.be.true;
    //     });

    //     it("Should call the host list API continuosly after a certain interval", function() {

    //         intervalSpy = sinon.spy($interval);
    //         throttled = throttle(intervalSpy);

    //         throttled();

    //         clock.tick(1000 * config.nodeRefreshInterval - 1);
    //         expect(intervalSpy.notCalled).to.be.true;

    //         clock.tick(1);
    //         expect(intervalSpy.called).to.be.true;

    //         expect(new Date().getTime()).to.be.equal(1000 * config.nodeRefreshInterval);

    //         function throttle(callback) {

    //             return function() {

    //                 clearTimeout(timer);
    //                 args = [].slice.call(arguments);

    //                 timer = setTimeout(function() {
    //                     callback.apply(this, args);
    //                 }, 1000 * config.nodeRefreshInterval);
    //             };
    //         }
    //     });

    //     it("Should cancel the timer", function() {
    //         sinon.stub($interval, "cancel");
    //         $scope.$destroy();

    //         expect($interval.cancel.calledOnce).to.be.true;
    //     });

    //     it("Should listen GotClusterData event broadcast", function() {
    //         $rootScope.clusterData = null;
    //         $scope.$broadcast("GotClusterData");
    //         expect($state.go.calledWith("clusters")).to.be.true;

    //         $rootScope.clusterData = [];
    //         $scope.$broadcast("GotClusterData");
    //         expect($state.go.calledWith("clusters")).to.be.true;

    //         $rootScope.clusterData = ["cluster1"];
    //         $scope.$broadcast("GotClusterData");
    //         expect($state.go.calledOnce).to.be.false;
    //     });


    //     it("Should take user to host detail page", function() {
    //         var host = hostList.nodes[0];
    //         vm.goToHostDetail(host);
    //         expect($state.go.calledWith("host-detail", { clusterId: vm.clusterId, hostId: host.id }));
    //     });

    // });

    // it("Should sort the list with changed parameters", function() {
    //     vm = $componentController("hostList", { $scope: $scope });

    //     vm.sortConfig.currentField = {
    //         id: "name",
    //         title: "Name",
    //         sortType: "alpha"
    //     };

    //     vm.sortConfig.isAscending = false;
    //     getHostListDeferred.resolve(hostList.nodes);
    //     $rootScope.$digest();
    //     vm.hostList.forEach(function(o) { delete o.$$hashKey });
    //     expect(vm.hostList).to.deep.equal(hostList.sortedformattedOutput);
    // });

    // it("Should filter the list with 'name' parameters", function() {
    //     vm = $componentController("hostList", { $scope: $scope });
    //     vm.filters = [{
    //         id: "name",
    //         title: "Name",
    //         placeholder: "Filter by Name",
    //         filterType: "text"
    //     }];
    //     vm.filters[0].value = "27";
    //     getHostListDeferred.resolve(hostList.nodes);
    //     $rootScope.$digest();
    //     vm.hostList.forEach(function(o) { delete o.$$hashKey });
    //     expect(vm.filtersText).to.be.equal("Name : 27\n");
    //     expect(vm.filteredHostList).to.deep.equal(hostList.filteredNameFormattedOutput);
    // });

    // it("Should filter the list with 'status' parameters", function() {
    //     vm = $componentController("hostList", { $scope: $scope });
    //     vm.filters = [{
    //         id: "status",
    //         title: "Status",
    //         placeholder: "Filter by Status",
    //         filterType: "select",
    //         filterValues: ["UP", "DOWN"]
    //     }];
    //     vm.filters[0].value = "DOWN";
    //     getHostListDeferred.resolve(hostList.nodes);
    //     $rootScope.$digest();
    //     vm.hostList.forEach(function(o) { delete o.$$hashKey });
    //     expect(vm.filtersText).to.be.equal("Status : DOWN\n");
    //     expect(vm.filteredHostList).to.deep.equal(hostList.filteredStatusFormattedOutput);
    // });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });

});