describe("UNIT DIRECTIVE: generateForm", function () {
    "use strict";

    // Angular injectables
    var $compile, $rootScope, $httpBackend, $q;

    // Module defined (non-Angular) injectables
    var $scope, generateForm, utils;

    // Local variables used for testing
    var element, formRequestResponse, directiveScope, vm, template, takeActionDeferred, callBackDeferred, callBackCallPara;

    // Initialize modules
    beforeEach(function () {
        module("TendrlModule");
        module("TestDataModule");
    });

    beforeEach(function () {

        inject(function (_$compile_, _$rootScope_, _$httpBackend_, _generateForm_, _$q_, _utils_) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            generateForm = _generateForm_;
            $q = _$q_;
            utils = _utils_;

            $scope = $rootScope.$new();

            takeActionDeferred = $q.defer();
            sinon.stub(utils, "takeAction").returns(takeActionDeferred.promise);
        });
    });

    describe("generateForm unit testing", function() {

        beforeEach(function() {
            
            template = "<generate-form form-attributes='formAttributes' submit-btn-name='Submit' post-url='postUrl' call-back-function='callBack'></generate-form>";
            element = $compile(template)($scope);                      
            $scope.formAttributes = generateForm.formAttributes;
            $scope.postUrl = generateForm.postUrl;
            $scope.callBack = function callBack(response) { };

            directiveScope = element.isolateScope();

            // Exercise SUT
            $scope.$digest();
        });

        it("generate-form directive creates a template", function() {
            expect(element.html()).to.not.equal("");
            expect(element.length).to.be.equal(1);
        });

        it("generate-form should be present in DOM", function() {
            expect((element.html()).indexOf("container")).to.not.equal(-1);
            expect((element.html()).indexOf("Submit")).to.not.equal(-1);
        });

        describe("Function: performFunction", function() {

            beforeEach(function() {
                callBackDeferred = $q.defer();
                sinon.stub(directiveScope, "callBack").returns(callBackDeferred.promise);

                directiveScope.performAction();
                takeActionDeferred.resolve(generateForm.response);
                $scope.$digest();
            });

            it("takeAction function should be called with desired parameter", function() {
                expect(utils.takeAction.calledOnce).to.be.true;
                expect(utils.takeAction.calledWithMatch(directiveScope.requestData)).to.be.true;
            });

            /*
            //Todo: Need to find the way to test parameter passed's method
            it("callBack function should be called with desired parameter", function() {
                expect(directiveScope.callBack.calledOnce).to.be.true;
                expect(directiveScope.callBack.calledWithMatch(generateForm.response)).to.be.true;
            }); */

            it("performFunction should modify the formAttributes", function() {
                expect(directiveScope.requestData).to.deep.equal(generateForm.manipulatedData);
            });

        });

    });
});