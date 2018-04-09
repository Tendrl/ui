describe("Unit Component: Add User", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $componentController, $event, $uibModal;

    // Module defined (non-Angular) injectables
    var config, utils, userStore, capitalizeFilter, Notifications;

    // Local variables used for testing
    var createUserDeferred, vm, clock, throttled, intervalSpy, timer, args, element;

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
            $uibModal = _$uibModal_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/users/add-user/add-user.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _userStore_, _capitalizeFilter_, _Notifications_) {
            utils = _utils_;
            config = _config_;
            userStore = _userStore_;
            capitalizeFilter = _capitalizeFilter_;
            Notifications = _Notifications_;
        });

    });

    beforeEach(function() {
        $state.current.name = "add-user";
        createUserDeferred = $q.defer();

        sinon.stub($state, "go");

        clock = sinon.useFakeTimers();

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("addUser", { $scope: $scope });

        expect(vm.typePassword).to.be.false;
        expect(vm.confirmPassword).to.be.false;
        expect(vm.errorMsg).to.be.equal("");
        expect(vm.user).to.be.an("object").that.is.not.empty;
        expect(vm.user.notification).to.be.true;
        expect(vm.user.role).to.be.equal("admin");
    });

    describe("Add User List workflows", function() {
        beforeEach(function() {
            sinon.stub(userStore, "createUser").returns(createUserDeferred.promise);
            vm = $componentController("addUser", { $scope: $scope });
            $rootScope.$digest();
        });

        it("Should test toggleTypePassword", function() {
            vm.typePassword = false;
            vm.toggleTypePassword();
            expect(vm.typePassword).to.be.true;
        });

        it("Should test toggleConfirmPassword", function() {
            vm.confirmPassword = false;
            vm.toggleConfirmPassword();
            expect(vm.confirmPassword).to.be.true;
        });

    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });

});