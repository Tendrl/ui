describe("Unit Controller: clusterController", function() {
    "use strict";

    // Angular injectables
    var $q, $httpBackend, $injector, $controller, $rootScope, $state, $templateCache, $compile, $interval, $destroy;

    // Module defined (non-Angular) injectables
    var $scope, config, utils, clusterList;

    // Local variables used for testing
    var getListDeferred, vm,  clock, throttled, intervalSpy, timer, args;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$controller_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _clusterList_, _$interval_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            clusterList = _clusterList_;
            $interval = _$interval_;
            //$destroy = _$destroy_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/cluster/cluster-list/cluster-list.html");

            $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_) {
            utils = _utils_;
            config = _config_;
        });

    });

    beforeEach(function() {

        $rootScope.clusterData = clusterList;
        $state.current.name = "cluster";

        vm = $controller("clusterController", { $scope: $scope });
        sinon.stub($state, "go");
        sinon.stub($interval, "cancel");
        clock = sinon.useFakeTimers();

        config.refreshIntervalTime = 120;

    });

    it("Should get list of clusters", function() {
        expect($rootScope.clusterData).to.deep.equal(clusterList);
    });

    it("Should format the list of clusters", function() {
        expect(vm.clusterList).to.deep.equal(clusterList.formattedOutput);
    });

    it("Should go to import cluster view if 'Import Cluster' button is clicked", function() {
        // Exercise SUT - when button is clicked, should navigate to 'import-cluster' state
        vm.importCluster();

        // Verify result (behavior) - if transitioned to newer state or not
        expect($state.go.calledWith("import-cluster")).to.be.true;       
        
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
        $scope.$destroy();

        expect($interval.cancel.calledOnce).to.be.true;
    });

    afterEach(function () {

        // Tear down
        $state.go.restore();
        clock.restore(); 
    });

});
