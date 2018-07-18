describe("Unit Component: clusterList", function() {
    "use strict";

    // Angular injectables
    var $scope, $q, $httpBackend, $injector, $rootScope, $state, $templateCache, $compile, $interval, $destroy, $uibModal, $componentController, $event;

    // Module defined (non-Angular) injectables
    var config, utils, clusterList, Notifications, clusterStore;

    // Local variables used for testing
    var getClusterListDeferred, vm, clock, throttled, intervalSpy, timer, args, dashboardStub, element;

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
            templateHtml = $templateCache.get("/modules/cluster/cluster-list/cluster-list.html");

            element = $compile(templateHtml)($scope);
        });

        inject(function(_utils_, _config_, _clusterStore_, _Notifications_, _clusterList_) {
            utils = _utils_;
            config = _config_;
            clusterList = _clusterList_;
            clusterStore = _clusterStore_;
            Notifications = _Notifications_;
        });

    });

    beforeEach(function() {

        $rootScope.clusterData = clusterList;
        $state.current.name = "clusters";
        getClusterListDeferred = $q.defer();

        sinon.stub($state, "go");
        sinon.stub(clusterStore, "getClusterList").returns(getClusterListDeferred.promise);
        sinon.stub(utils, "redirectToGrafana")

        clock = sinon.useFakeTimers();
        config.refreshIntervalTime = 120;

    });

    it("Should initialize all the properties", function() {
        vm = $componentController("clusterList", { $scope: $scope });

        expect(vm.isDataLoading).to.be.true;
        expect(vm.clusterNotPresent).to.be.false;
        expect(vm.flag).to.be.false;
        expect(vm.enProfilingBtnClicked).to.be.false;
        expect(vm.disProfilingBtnClicked).to.be.false;
        expect($rootScope.selectedClusterOption).to.be.equal("allClusters");
        expect(vm.filtersText).to.be.equal("");
        expect(vm.filters).to.be.an("array").that.is.empty;
        expect(vm.clusterList).to.be.an("array").that.is.empty;
        expect(vm.filteredClusterList).to.be.an("array").that.is.empty;
        expect(vm.sortConfig.fields).to.deep.equal(clusterList.fields);
        expect(vm.sortConfig.onSortChange).to.be.a("function");
        expect(vm.filterConfig.fields).to.deep.equal(clusterList.filterFields);
        expect(vm.filterConfig.onFilterChange).to.be.a("function");
        expect(vm.filterConfig.appliedFilters).to.be.an("array").that.is.empty;
        expect(clusterStore.selectedTab).to.be.equal(1);
    });

    describe("Cluster List workflows", function() {
        beforeEach(function() {
            vm = $componentController("clusterList", { $scope: $scope });
            getClusterListDeferred.resolve(clusterList.clusters);
            $rootScope.$digest();
        });

        it("Should get list of clusters", function() {
            expect(vm.clusterList).to.deep.equal(clusterList.clusters);
        });

        it("Should take the user to dashboard on clicking Dashboard button", function() {
            // Exercise SUT
            var cluster = clusterList.clusters[0];
            vm.redirectToGrafana(cluster);

            // Verify result (behavior)
            expect(utils.redirectToGrafana.calledWith("glance", { clusterId: cluster.clusterId })).to.be.true;
        });

        it("Should enable/disable profiling on clicking Enable/Disable profiling link", function() {
            // Exercise SUT
            var cluster = clusterList.clusters[0],
                profilingDeferred = $q.defer(),
                event = new Event("click");

            sinon.stub(clusterStore, "doProfilingAction").returns(profilingDeferred.promise);
            sinon.stub(Notifications, "message");
            sinon.stub(event, "stopPropagation");

            vm.doProfilingAction(event, cluster, "Enable", cluster.clusterId);
            profilingDeferred.resolve(clusterList.profilingResponse);
            $rootScope.$digest();

            // Verify result (behavior)
            expect(Notifications.message.calledWith("success", "", "Enable volume profiling job initiated successfully.")).to.be.true;
            expect(cluster.disableAction).to.be.true;
            expect(event.stopPropagation.calledOnce).to.be.true;
        });

        it("Should give error while enable/disable profiling on clicking Enable/Disable profiling link", function() {
            // Exercise SUT
            var cluster = clusterList.clusters[0],
                profilingDeferred = $q.defer(),
                event = new Event("click");

            sinon.stub(clusterStore, "doProfilingAction").returns(profilingDeferred.promise);
            sinon.stub(Notifications, "message");
            sinon.stub(event, "stopPropagation");

            vm.doProfilingAction(event, cluster, "Enable", cluster.clusterId);
            profilingDeferred.reject("error");
            $rootScope.$digest();

            // Verify result (behavior)
            expect(Notifications.message.calledWith("danger", "", "Failed to enable volume profile.")).to.be.true;
            expect(event.stopPropagation.calledOnce).to.be.true;
        });

        it("Should set the flag by addTooltip", function() {
            // Exercise SUT
            sinon.stub(utils, "tooltip").returns(true);
            vm.addTooltip();

            //Verify result (behavior)
            expect(vm.flag).to.be.true;
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
            sinon.stub($interval, "cancel");
            $scope.$destroy();

            expect($interval.cancel.calledOnce).to.be.true;
        });

        it("Should go to Import Flow View", function() {
            var cluster = clusterList.clusters[0];
            vm.goToImportFlow(cluster);
            expect($state.go.calledWith("import-cluster", { clusterId: cluster.integrationId }));
        });

        it("Should go to Cluster Host View", function() {
            var cluster = clusterList.clusters[0];
            vm.goToClusterHost(cluster);
            expect($state.go.calledWith("cluster-hosts", { clusterId: cluster.clusterId }));
        });

        it("Should go to Task Detail View when cluster is expanding", function() {
            var cluster = clusterList.clusters[0];
            cluster.jobType = "ExpandClusterWithDetectedPeers";
            vm.goToTaskDetail(cluster);
            expect($state.go.calledWith("task-detail", { clusterId: cluster.integrationId, taskId: cluster.currentTaskId }));
        });

        it("Should go to Task Detail View when cluster is changing profiling", function() {
            var cluster = clusterList.clusters[0];
            cluster.jobType = "EnableDisableVolumeProfiling";
            vm.goToTaskDetail(cluster);
            expect($state.go.calledWith("task-detail", { clusterId: cluster.integrationId, taskId: cluster.currentTaskId }));
        });

        it("Should go to Global Task Detail View", function() {
            var cluster = clusterList.clusters[0];
            vm.goToTaskDetail(cluster);
            expect($state.go.calledWith("global-task-detail", { clusterId: cluster.integrationId, taskId: cluster.currentTaskId }));
        });

        it("Should show import button", function() {
            var cluster = clusterList.clusters[0];
            $rootScope.userRole = "normal";
            expect(vm.showImportBtn(cluster)).to.be.true;
        });

        it("Should disable import button", function() {
            var cluster = clusterList.clusters[1];
            cluster.currentStatus = "in_progress";
            $rootScope.userRole = "normal";
            expect(vm.disableImportBtn(cluster)).to.be.true;
        });

        it("Should show dashboard button", function() {
            var cluster = clusterList.clusters[1];
            expect(vm.showDashboardBtn(cluster)).to.be.true;
        });

        it("Should show Kebab Menu", function() {
            var cluster = clusterList.clusters[1];
            $rootScope.userRole = "normal";
            expect(vm.showKebabMenu(cluster)).to.be.true;
        });

        it("Should hide Expand button", function() {
            var cluster = clusterList.clusters[0];
            $rootScope.userRole = "limited";
            expect(vm.showExpandBtn(cluster)).to.be.false;
        });

        it("Should show tooltip", function() {
            var cluster = clusterList.clusters[1];
            cluster.currentStatus = "finished";
            expect(vm.getTemplate(cluster)).to.be.equal("The cluster is successfully imported for viewing monitoring data and metrics.");
        });

        it("Should get an icon class when cluster is unmanaged", function() {
            var cluster = clusterList.clusters[0];

            var cls = vm.getClass(cluster);
            expect(cls).to.be.equal("fa ffont fa-question");
        });

        it("Should get an icon class when cluster is unhealthy", function() {
            var cluster = clusterList.clusters[0];
            cluster.status = "HEALTH_ERR";

            var cls = vm.getClass(cluster);
            expect(cls).to.be.equal("pficon pficon-warning-triangle-o");
        });

        it("Should get an icon class when cluster is ok", function() {
            var cluster = clusterList.clusters[0];
            cluster.status = "HEALTH_OK";

            var cls = vm.getClass(cluster);
            expect(cls).to.be.equal("pficon pficon-ok");
        });


        it("Should get an icon class when cluster is expanding", function() {
            var cluster = clusterList.clusters[0];
            cluster.state = "expanding";
            cluster.currentStatus = "in_progress";
            cluster.jobType = "ExpandClusterWithDetectedPeers";

            var cls = vm.getClass(cluster);
            expect(cls).to.be.equal("pficon pficon-in-progress");
        });

    });

    it("Should check for error for cluster list API", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        getClusterListDeferred.reject("error");
        $rootScope.$digest();

        expect(vm.clusterList).to.be.an("array").that.is.empty;
        expect(vm.filteredClusterList).to.be.an("array").that.is.empty;
        expect(vm.isDataLoading).to.be.false;
    });

    it("Should sort the list with changed parameters of Status", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        vm.sortConfig.currentField = {
            id: "status",
            title: "Status",
            sortType: "alpha"
        };
        vm.sortConfig.isAscending = false;
        getClusterListDeferred.resolve(clusterList.clusters);
        $rootScope.$digest();
        expect(vm.filteredClusterList).to.deep.equal(clusterList.sortedformattedOutputStatus);
    });

    it("Should sort the list with changed parameters of Name", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        vm.sortConfig.currentField = {
            id: "name",
            title: "Name",
            sortType: "alpha"
        };
        vm.sortConfig.isAscending = false;
        getClusterListDeferred.resolve(clusterList.clusters);
        $rootScope.$digest();
        expect(vm.filteredClusterList).to.deep.equal(clusterList.sortedformattedOutputName);
    });

    it("Should sort the list with changed parameters of sdsVersion", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        vm.sortConfig.currentField = {
            id: "sdsVersion",
            title: "Cluster Version",
            sortType: "alpha"
        };
        vm.sortConfig.isAscending = false;
        getClusterListDeferred.resolve(clusterList.clusters);
        $rootScope.$digest();
        expect(vm.filteredClusterList).to.deep.equal(clusterList.sortedformattedOutputSds);
    });

    it("Should sort the list with changed parameters of managed", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        vm.sortConfig.currentField = {
            id: "managed",
            title: "Managed",
            sortType: "alpha"
        };
        vm.sortConfig.isAscending = false;
        getClusterListDeferred.resolve(clusterList.clusters);
        $rootScope.$digest();
        expect(vm.filteredClusterList).to.deep.equal(clusterList.sortedformattedOutputManaged);
    });

    it("Should filter the list with 'name' parameters", function() {
        vm = $componentController("clusterList", { $scope: $scope });
        vm.filters = [{
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }];
        vm.filters[0].value = "f755";
        getClusterListDeferred.resolve(clusterList.clusters);
        $rootScope.$digest();
        expect(vm.filtersText).to.be.equal("Name : f755\n");
        expect(vm.filteredClusterList).to.deep.equal(clusterList.filteredNameFormattedOutput);
    });

    afterEach(function() {
        // Tear down
        $state.go.restore();
        clock.restore();
    });

});
