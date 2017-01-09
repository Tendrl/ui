describe("Unit Controller: hostController", function() {
    "use strict";

    // Angular injectables
    var $q, $httpBackend, $injector, $controller, $rootScope, $state, $templateCache, $compile, $interval, $destroy;

    // Module defined (non-Angular) injectables
    var $scope, config, utils, hostList;

    // Local variables used for testing
    var getListDeferred, vm,  clock, throttled, intervalSpy, timer, args, getObjectListDeferred;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$controller_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _hostList_, _$interval_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            hostList = _hostList_;
            $interval = _$interval_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/host/host-list/host-list.html");

            $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_) {
            utils = _utils_;
            config = _config_;
        });

    });

    beforeEach(function() {

        $state.current.name = "host";
        getObjectListDeferred = $q.defer();

        sinon.stub($interval, "cancel");
        sinon.stub(utils, "getObjectList").returns(getObjectListDeferred.promise);
        sinon.stub(utils, "getClusterDetails").returns(hostList.clusterName);
        clock = sinon.useFakeTimers();

        vm = $controller("hostController", { $scope: $scope });

        config.refreshIntervalTime = 120;
        getObjectListDeferred.resolve(hostList);
        $scope.$digest();
    });

    it("Should get list of host", function() {
        expect(utils.getObjectList.calledOnce).to.be.true;
    });

    it("Should format the list of host", function() {
        expect(vm.hostList).to.deep.equal(hostList.formattedOutput);
    });

    it("Should update the pool list continuosly after a certain interval", function() {

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
        clock.restore(); 
    });

});
