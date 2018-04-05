describe("Unit Component: Edit User", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $componentController, $event, $uibModal, $stateParams;

    // Module defined (non-Angular) injectables
    var config, utils, userStore, capitalizeFilter, Notifications, editUser;

    // Local variables used for testing
    var getUserListDeferred, getUserDetailDeferred, vm, clock, throttled, intervalSpy, timer, args, element;

    // Initialize modules
    beforeEach(function() {
        module("TendrlModule");
        module("TestDataModule");
        module("templates");
    });

    beforeEach(function() {

        var templateHtml;

        inject(function(_$q_, _$componentController_, _$rootScope_, _$state_, _$templateCache_, _$compile_, _$interval_, _$uibModal_, _$stateParams_) {
            $q = _$q_;
            $componentController = _$componentController_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            $interval = _$interval_;
            $uibModal = _$uibModal_;
            $stateParams = _$stateParams_;

            $scope = $rootScope.$new();
            templateHtml = $templateCache.get("/modules/users/add-user/add-user.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _userStore_, _capitalizeFilter_, _Notifications_, _editUser_) {
            utils = _utils_;
            config = _config_;
            userStore = _userStore_;
            capitalizeFilter = _capitalizeFilter_;
            Notifications = _Notifications_;
            editUser = _editUser_;
        });

    });

    beforeEach(function() {
        $state.current.name = "edit-user";
        $stateParams.userId = "user1";
        getUserListDeferred = $q.defer();
        getUserDetailDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(userStore, "getUserList").returns(getUserListDeferred.promise);
        sinon.stub(userStore, "getUserDetail").returns(editUser.users[0]);

        clock = sinon.useFakeTimers();

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("editUser", { $scope: $scope, $stateParams: $stateParams });
        vm.username = $stateParams.userId;

        expect(vm.typePassword).to.be.false;
        expect(vm.confirmPassword).to.be.false;
        expect(vm.userDetail).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.true;
        expect(vm.errorMsg).to.be.equal("");
        expect(vm.user).to.be.an("object").that.is.empty;
    });

    describe("Edit User List workflows", function() {
        beforeEach(function() {
            vm = $componentController("editUser", { $scope: $scope, $stateParams: $stateParams });
            vm.username = $stateParams.userId;
            getUserListDeferred.resolve(editUser.users);
            getUserDetailDeferred.resolve(editUser.users[0]);
            $rootScope.$digest();
        });

        it("Should get users details", function(){
            expect(vm.isDataLoading).to.be.false;
            expect(vm.user).to.deep.equal(editUser.users[0]);
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