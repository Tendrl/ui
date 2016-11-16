describe("UNIT CONTROLLER - createVolumeController", function () {
    "use strict";

    // Angular injectables
    var $q, $injector, $controller, $rootScope, $state, $location, $timeout, $templateCache, $compile;

    // Module defined (non-Angular) injectables
    var $scope, utils, config, createVolume;

    // Local variables used for testing
    var getAttributeListDeferred, vm;

    // Initialize modules
    beforeEach(function () {
        module("TendrlModule");
        module("templates");
        module("TestDataModule");
    });

    // Define all injectables and compile template
    beforeEach(function () {

        var templateHtml;

        inject(function (_$q_, _$controller_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _createVolume_, _$location_) {
            $q = _$q_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            createVolume = _createVolume_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/volume/create-volume/create-volume.html");

            $compile(templateHtml)($scope);
        });

        inject(function (_utils_, _config_) {
            utils = _utils_;
            config = _config_;
        });
    });

    // Create controller instance to be used by all the unit tests
    beforeEach(function () {

        getAttributeListDeferred = $q.defer();

        sinon.stub(utils, "getAttributeList").returns(getAttributeListDeferred.promise);
        sinon.stub(utils, "getActionDetails").returns(createVolume.actionDetails);
        config.clusterId = "3969b68f-e927-45da-84d6-004c67974f07";

        goTo("create-volume");
        $state.current.name = "create-volume";

        // Exercise SUT
        vm = $controller("createVolumeController", {
            $scope: $scope
        });

    });

    describe("Initialization Block", function () {

        beforeEach(function () {
            vm.postUrl = utils.getActionDetails();
        });

        // Verify result (behavior)
        it("Should set the initialization properties", function () {
            expect(vm.notification).to.be.empty;
            expect(vm.formAttributes).to.deep.equal({data: {}, isEmpty: true});
            expect(vm.postUrl).to.deep.equal(createVolume.actionDetails);            
        });

        it("getAttributeList function should be called with desired parameter", function() {
            expect(utils.getAttributeList.calledOnce).to.be.true;
            expect(utils.getAttributeList.calledWithMatch(createVolume.requestData.clusterId, createVolume.requestData.inventoryName)).to.be.true;
        });

        it("Should set formAttributes", function() {
            getAttributeListDeferred.resolve(createVolume.attributes);
            $scope.$digest();
            expect(vm.formAttributes.isEmpty).to.be.false;
            expect(vm.formAttributes.data).to.deep.equal(createVolume.attributes);
        });

    });

    describe("Funtcion: closeNotification", function () {

        beforeEach(function () {
            vm.closeNotification();
        });

        it("Should set notification to empty when notification window is closed", function() {
            expect(vm.notification).to.be.equal("");
        });
    });

    describe("Funtcion: callBack", function () {

        beforeEach(function () {
            vm.callBack({job_id: 1234, status: "in progress"});
        });

        it("Should set notification to empty when notification window is closed", function() {
            expect(vm.notification).to.be.equal("Volume is created successfully. and JOB-ID is - 1234 And Volume creation is in progress");
        });
    });

    afterEach(function () {
        // Tear down
        utils.getAttributeList.restore();
    });

    function goTo(url) {
        $location.url(url);
        $rootScope.$digest();
    }
});