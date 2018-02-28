module.exports = function (config) {

    config.set({
        basePath: "",
        frameworks: ["mocha", "chai", "sinon"],
        files: [

            "dist/jsLibraries/libraries.js",
            "node_modules/angular-mocks/angular-mocks.js",

            // Add template files
            "src/**/*.html",

            "src/commons/js/*.js",
            "src/modules/**/*.js",
            "src/commons/services/*.js",
            "src/commons/filters/*.js",
            "src/commons/components/**/*.js",
            "src/commons/factories/**/*.js",
            "src/commons/stores/**/*.js",

            // Add all the test files
            "test/unit/*.js"
        ],

        exclude: [],

        preprocessors: {
            "/**/*.html": "ng-html2js",
            "src/**/*.js": "coverage"
        },

        ngHtml2JsPreprocessor: {
            stripPrefix: "src/",
            prependPrefix: '/',
            moduleName: "templates"
        },

        //reporters: ["progress", "coverage"],
        reporters: ["mocha", "coverage"],
        mochaReporter: {
            // full, autowatch, minimal
            output: "autowatch",
            ignoreSkipped: false
        },

        browserNoActivityTimeout: 20000,
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ["PhantomJS"],
        singleRun: true,
        coverageReporter: {
            dir: "./coverage",
            reporters: [{
                type: "cobertura",
                subdir: ".",
                file: "cobertura.xml"
            }, {
                type: "text"
            }]
        }
    });
};
