describe("UNIT SERVICE - utils", function () {
    "use strict";

    // Angular injectables
    var $q, $httpBackend;

    // Module defined (non-Angular) injectables
    var utils, config, utilsMockResponse;

    // Initialize modules
    beforeEach(function () {

        module("TendrlModule");
        module("TestDataModule");
    });

    beforeEach(function () {
        inject(function (_$httpBackend_, _$q_, _config_, _utilsMockResponse_) {
            $httpBackend = _$httpBackend_;
            $q = _$q_;
            config = _config_;
            utilsMockResponse = _utilsMockResponse_;
        });

        inject(function (_utils_) {
            utils = _utils_;
        });

    });

    it("Should get desired action details from getActionDetails", function() {
        
         // Setup data
        config.baseUrl = "https://abc:8080",
        config.clusterId = "1234";

        utils.setActionDetails({}, "Create");

        // Exercise SUT
        expect(utils.getActionDetails()).to.deep.equal({action: {method: "POST", url: "https://abc:8080cluster/1234/volume/create"}, actionName: "Create"});
    });

    it("Should perform action when form is submitted", function() {
        var data, response;

        // Setup data
        data = {
                Node :["279-78774-782"],
                sds_name:"sds",
                sds_version:"sds"
            };

        response = {
            "job_id": "1234",
            "job_status": "in progress"
        };

        // Setup data - expectation
        $httpBackend.expectPOST("https//abc.com")
            .respond(200, response);

        // Exercise SUT
        utils.takeAction(data, "https//abc.com")
            .then(function (data) {
            // Verify result (state)
            expect(data.job_id).to.equal(response.job_id);
            expect(data.job_status).to.equal(response.job_status);
        });
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should get list of options when type is 'LIST'", function() {
        var listType, response;

        // Setup data
        listType = "Node";
        response = utilsMockResponse.listOptions;

        // Setup data - expectation
        $httpBackend.expectGET("/api/" + listType +".json")
            .respond(200, response);

        // Exercise SUT
        utils.getListOptions("Node")
            .then(function (data) {
            // Verify result (state)
            expect(data).to.deep.equal(response);
        });
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should get list of attributes", function() {
        var clusterId, inventory, response;

        // Setup data
        clusterId = "1234";
        inventory = "volume";
        config.baseUrl = "https://abc:8080/";
        response = utilsMockResponse.attributeList;

        // Setup data - expectation
        $httpBackend.expectGET(config.baseUrl + "cluster/" + clusterId + "/" + inventory + "/attributes")
            .respond(200, response);

        // Exercise SUT
        utils.getAttributeList("1234", "volume")
            .then(function (data) {
            // Verify result (state)
            expect(data).to.deep.equal(response);
        });
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should get cluster import flows", function() {
        var response = utilsMockResponse.importFlows;

        // Setup data - expectation
        $httpBackend.expectGET("/api/cluster-import-flow.json")
            .respond(200, response);

        // Exercise SUT
        utils.getClusterImportFlow()
            .then(function (data) {
            // Verify result (state)
            expect(data).to.deep.equal(response);
        });
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should get list of actions", function() {
        var clusterId, inventory, response;

        // Setup data
        clusterId = "1234";
        inventory = "volume";
        config.baseUrl = "https://abc:8080/";
        response = utilsMockResponse.actionList;

        // Setup data - expectation
        $httpBackend.expectGET(config.baseUrl + "cluster/" + clusterId + "/" + inventory + "/actions")
            .respond(200, response);

        // Exercise SUT
        utils.getActionList(clusterId, inventory)
            .then(function (data) {
            // Verify result (state)
            expect(data).to.deep.equal(response);
        }); 
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});