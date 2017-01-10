describe("Unit Controller: fileShareController", function() {
    "use strict";

    // Angular injectables
    var $q, $httpBackend, $injector, $controller, $rootScope, $state, $templateCache, $compile, $interval, $destroy;

    // Module defined (non-Angular) injectables
    var $scope, config, utils, fileShareList;

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

        inject(function(_$q_, _$controller_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _fileShareList_, _$interval_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            fileShareList = _fileShareList_;
            $interval = _$interval_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/file-share/file-share-list/file-share-list.html");

            $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_) {
            utils = _utils_;
            config = _config_;
        });

    });

    beforeEach(function() {

        $state.current.name = "file-share";

        sinon.stub($interval, "cancel");
        sinon.stub(utils, "getFileShareDetails").returns(fileShareList.fileShares);
        sinon.stub(utils, "getClusterDetails").returns(fileShareList.clusterName);
        clock = sinon.useFakeTimers();

        vm = $controller("fileShareController", { $scope: $scope });

        config.refreshIntervalTime = 120;

    });

    it("Should get list of file-share", function() {
        expect(utils.getFileShareDetails.calledOnce).to.be.true;
    });

    it("Should format the list of file-share", function() {
        expect(vm.fileShareList).to.deep.equal(fileShareList.formattedOutput);
    });

    it("Should update the file-share list continuosly after a certain interval", function() {

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
