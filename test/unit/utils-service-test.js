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

    it("Should perform action when form is submitted", function() {
        var data, response, postUrl

        // Setup data
        data = {
            Node :["279-78774-782"],
            sds_name:"sds",
            sds_version:"sds"
        };

        response = {
            "job_id": "1234"
        };

        postUrl = "GetNodeList"

        // Setup data - expectation
        $httpBackend.expectPOST(config.baseUrl + postUrl)
            .respond(200, response);

        // Exercise SUT
        utils.takeAction(data, postUrl, "POST")
            .then(function (data) {
            // Verify result (state)
            expect(data.job_id).to.equal(response.job_id);
        });
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should get object flows", function() {
        var response, clusterId;
        response = utilsMockResponse.objectFlows;
        clusterId = "2323-ab224"

        // Setup data - expectation
        $httpBackend.expectGET(config.baseUrl + clusterId + "/Flows")
            .respond(200, response);

        // Exercise SUT
        utils.getObjectWorkflows(clusterId)
            .then(function (data) {
            // Verify result (state)
            expect(data).to.deep.equal(response);
        });
        $httpBackend.flush();


        // Verify result (behavior)
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("Should get object list", function() {
        var response, objectType, clusterId;
        response = utilsMockResponse.objectList;
        objectType = "Node";
        clusterId = "2323-ab224";

        // Setup data - expectation
        $httpBackend.expectGET(config.baseUrl + "Get" + objectType +"List")
            .respond(200, response);

        // Exercise SUT
        utils.getObjectList(objectType, clusterId)
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