"use strict";

describe("Common tests", function() {

    var tendrlModule;

    beforeEach(function() {
         tendrlModule = module("TendrlModule");
    });

    it("TendrlModule should be registered", function() {
    	expect(tendrlModule).not.to.equal(null);
    });

});