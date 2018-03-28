describe("Unit Component: UserList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $componentController, $event, $uibModal;

    // Module defined (non-Angular) injectables
    var config, utils, userStore, userList, capitalizeFilter, Notifications;

    // Local variables used for testing
    var getUserListDeferred, vm, clock, throttled, intervalSpy, timer, args, element;

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
            templateHtml = $templateCache.get("/modules/users/user-list/users.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _userStore_, _userList_, _capitalizeFilter_, _Notifications_) {
            utils = _utils_;
            config = _config_;
            userStore = _userStore_;
            userList = _userList_;
            capitalizeFilter = _capitalizeFilter_;
            Notifications = _Notifications_;
        });

    });

    beforeEach(function() {
        $state.current.name = "users";
        getUserListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(userStore, "getUserList").returns(getUserListDeferred.promise);

        clock = sinon.useFakeTimers();

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("users", { $scope: $scope });

        expect($rootScope.selectedClusterOption).to.be.null;
        expect(vm.userList).to.be.an("array").that.is.empty;
        expect(vm.filtersText).to.be.equal("");
        expect(vm.filteredUserList).to.be.an("array").that.is.empty;
        expect(vm.filters).to.be.an("array").that.is.empty;

        expect(vm.isDataLoading).to.be.true;
        expect(vm.filterConfig.fields).to.deep.equal(userList.fields);
        expect(vm.filterConfig.onFilterChange).to.be.a("function");
        expect(vm.filterConfig.appliedFilters).to.be.an("array").that.is.empty;
    });

    describe("User List workflows", function() {
        beforeEach(function() {
            vm = $componentController("users", { $scope: $scope });
            getUserListDeferred.resolve(userList.users);
            $rootScope.$digest();
        });

        it("Should get user list", function() {
            expect(vm.userList).to.deep.equal(userList.users);
            expect(vm.filteredUserList).to.deep.equal(userList.users);
            expect(vm.isDataLoading).to.be.false;
        });

        it("Should go to add user view", function() {
            vm.addNewUser();
            expect($state.go.calledWith("add-user"));
        });

        it("Should go to edit user view", function() {
            var user = userList.users[0];
            vm.editUserDetail(user.username);
            expect($state.go.calledWith("edit-user", { userId: user.username }));
        });

        it("Should open modal to expand cluster", function() {
            var user = userList.users[0];
            var fakeResult = {
                result: $q.resolve()
            };

            sinon.stub($uibModal, "open").returns(fakeResult);
            vm.deleteUser(user.username);
            expect($uibModal.open.calledOnce).to.be.true;
        });

        it("Should toggle notification", function() {
            var user = userList.users[0],
                userDeferred = $q.defer();

            sinon.stub(userStore, "editUser").returns(userDeferred.promise);
            sinon.stub(Notifications, "message");

            vm.toggleNotification(user);
            userDeferred.resolve(userList.editUserResponse);
            $rootScope.$digest();

            // Verify result (behavior)
            expect(Notifications.message.calledWith("success", "", "Email notification is now enabled for user1.")).to.be.true;

        });

        it("Should not toggle notification when edit API fails", function() {
            var user = userList.users[0],
                userDeferred = $q.defer();

            sinon.stub(userStore, "editUser").returns(userDeferred.promise);
            sinon.stub(Notifications, "message");

            vm.toggleNotification(user);
            userDeferred.reject("error");
            $rootScope.$digest();

            // Verify result (behavior)
            expect(Notifications.message.calledWith("danger", "", "Failed to enable email notification for user1.")).to.be.true;

        });

        it("Should broadcast UpdatedUserList function", function() {
            var users = userList.users;
            $scope.$apply(function() {
                $rootScope.$broadcast("UpdatedUserList", users);
            });
            expect(vm.userList).to.deep.equal(userList.users);
        });
    });

    it("Should verify for API fail", function() {
        vm = $componentController("users", { $scope: $scope });
        getUserListDeferred.reject("error");
        $rootScope.$digest();

        expect(vm.userList).to.be.an("array").that.is.empty;
        expect(vm.filteredUserList).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.false;
    });

    it("Should filter the list with 'username' parameters", function() {
        vm = $componentController("users", { $scope: $scope });
        vm.filters = [{
            id: "username",
            title: "User ID",
            placeholder: "Filter by User ID",
            filterType: "text"
        }];
        vm.filters[0].value = "1";
        getUserListDeferred.resolve(userList.users);
        $rootScope.$digest();
        vm.userList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filtersText).to.be.equal("User ID : 1\n");
        expect(vm.filteredUserList).to.deep.equal(userList.filteredUsernameFormattedOutput);
    });

    it("Should filter the list with 'name' parameters", function() {
        vm = $componentController("users", { $scope: $scope });
        vm.filters = [{
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }];
        vm.filters[0].value = "Steve";
        getUserListDeferred.resolve(userList.users);
        $rootScope.$digest();
        vm.userList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filtersText).to.be.equal("Name : Steve\n");
        expect(vm.filteredUserList).to.deep.equal(userList.filteredNameFormattedOutput);
    });

    it("Should filter the list with 'role' parameters", function() {
        vm = $componentController("users", { $scope: $scope });
        vm.filters = [{
            id: "role",
            title: "Role",
            placeholder: "Filter by Role",
            filterType: "text"
        }];
        vm.filters[0].value = "normal";
        getUserListDeferred.resolve(userList.users);
        $rootScope.$digest();
        vm.userList.forEach(function(o) { delete o.$$hashKey });
        expect(vm.filtersText).to.be.equal("Role : normal\n");
        expect(vm.filteredUserList).to.deep.equal(userList.filteredRoleFormattedOutput);
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });

});