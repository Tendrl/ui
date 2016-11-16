describe("UNIT DIRECTIVE: generateFormField", function () {
    "use strict";

    // Angular injectables
    var $compile, $rootScope, $httpBackend, $q;

    // Module defined (non-Angular) injectables
    var $scope, generateFormField, utils;

    // Local variables used for testing
    var element, formRequestResponse, directiveScope, vm, template, getObjectListDeferred;

    // Initialize modules
    beforeEach(function () {
        module("TendrlModule");
        module("TestDataModule");
    });

    beforeEach(function () {

        inject(function (_$compile_, _$rootScope_, _$httpBackend_, _generateFormField_, _$q_, _utils_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            generateFormField = _generateFormField_;
            $q = _$q_;
            utils = _utils_;

            $scope = $rootScope.$new();

            getObjectListDeferred = $q.defer();
            sinon.stub(utils,"getObjectList").returns(getObjectListDeferred.promise);
            template = "<generate-form-field attribute-details='attribute' field-name='key'></generate-form-field>";
        });
    });

    describe("generateFormField unit testing", function() {

        beforeEach(function() {            
            $scope.attribute = generateFormField.stringAttribute;
            
            $scope.key = generateFormField.stringKey;
            element = $compile(template)($scope);                      

            directiveScope = element.find("generate-form");

            // Exercise SUT
            $scope.$digest();
        });

        it("generate-form-field directive creates a template", function() {
            expect(element.html()).to.not.equal("");
            expect(element.length).to.be.equal(1);
        });

        it("generate-form-field should be present in DOM", function() {
            expect((element.html()).indexOf("generate-form-field-container")).to.not.equal(-1);
        });

    });

    describe("For type: 'String'", function() {

        beforeEach(function() {
            $scope.attribute = generateFormField.stringAttribute;
            
            $scope.key = generateFormField.stringKey;
            element = $compile(template)($scope);                      

            directiveScope = element.find("generate-form");

            // Exercise SUT
            $scope.$digest();
        });

        it("it should create input button of type='text'", function() {
            expect(element[0].querySelector("input[type=text]")).to.exist;
        });

    });

    describe("For type: 'Integer'", function() {

        beforeEach(function() {
            $scope.attribute = generateFormField.integerAttribute;
            
            $scope.key = generateFormField.integerKey;
            element = $compile(template)($scope);                      

            directiveScope = element.find("generate-form");

            // Exercise SUT
            $scope.$digest();
        });

        it("it should create input button of type='number'", function() {
            expect(element[0].querySelector("input[type=number]")).to.exist;
        });

    });

    describe("For type: 'Boolean'", function() {

        beforeEach(function() {
            $scope.attribute = generateFormField.booleanAttribute;
            
            $scope.key = generateFormField.booleanKey;
            element = $compile(template)($scope);                      

            directiveScope = element.find("generate-form-field");

            // Exercise SUT
            $scope.$digest();
        });

        it("it should create two input button of type='radio'", function() {
            expect(element[0].querySelectorAll("input[type=radio]").length).to.be.equal(2);
        });

    });

    describe("For type: 'List'", function() {

        beforeEach(function() {
            $scope.attribute = generateFormField.listAttribute;
            
            $scope.key = generateFormField.listKey;
            element = $compile(template)($scope);                      

            directiveScope = element.find("generate-form");

            // Exercise SUT
            $scope.$digest();

            getObjectListDeferred.resolve(generateFormField.listOptions);
            $scope.$digest();
        });

        it("it should select html element", function() {
            expect(element[0].querySelector("select")).to.exist;
        });

        it("should fetch the API call to get options", function() {
            expect(utils.getObjectList.calledOnce).to.be.true;
        });

    });
});