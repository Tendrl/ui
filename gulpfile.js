/* global require */
/* global process */

// Gulp specific
var gulp = require("gulp");
var concat = require("gulp-concat");
var runSequence = require("run-sequence");
var rename = require("gulp-rename");

// Logger modules
var noop = require("gulp-noop");
var log = require("fancy-log");
var colors = require("ansi-colors");

// File handling related modules
var del = require("del");
var fs = require("fs");

// Stream related modules
var merge = require("merge-stream");

// Network modules
var request = require("request");

// CSS, SASS and styling related modules
var cssimport = require("gulp-cssimport");
var sass = require("gulp-sass");
var minifyCSS = require("gulp-clean-css");
var autoprefixer = require("autoprefixer");
var postCss = require("gulp-postcss");

// JavaScript related modules
var eslint = require("gulp-eslint");
var uglify = require("gulp-uglify");

// Angular.js specific modules
var ngAnnotate = require("gulp-ng-annotate");

// Testing related modules
var KarmaServer = require("karma").Server;

var bs = require("browser-sync").create();
var historyApiFallback = require("connect-history-api-fallback");

// Local variables
var pkg = require("./package.json");
var pluginOpts = pkg.TendrlProps;
var buildMode = process.argv[2] || "release";
var browsers = pluginOpts.targetBrowsers;

// System wide paths
var paths = (function() {

    var src = "./src/";

    return {
        src: src,
        build: pluginOpts.buildDestination,
        dest: pluginOpts.buildDestination + "/",
        preloads: pluginOpts.preloads,
        preloadFolder: "preload/",
        jsLibraries: "jsLibraries/",
        cssLibraries: "cssLibraries/",
        cssMain: pluginOpts.cssMain,
        jsFiles: pluginOpts.jsFiles,
        htmlFiles: pluginOpts.htmlFiles,
        resources: pluginOpts.resources
    };
})();

// File selection filters
var filters = (function() {
    return {
        all: "**/*.*",
        js: "**/*.{js,jst}",
        css: "**/*.css",
        scss: "**/*.scss",
        images: "**/*.{jpg,jpeg,gif,png}",
        jscss: "**/*.{js,jst,css,scss}",
        html: "**/*.html"
    };
})();

//TO-DO: make task to copy fonts folder. For now the path woff2 is hardcoded.

// Clean the dist directory
del.sync([paths.dest]);

//Copy js file of the dependent libraries 
gulp.task("jsLibraries", function() {
    return gulp.src([
        "node_modules/d3/d3.min.js",
        "node_modules/c3/c3.min.js",
        "node_modules/jquery/dist/jquery.min.js",
        "node_modules/bootstrap/dist/js/bootstrap.min.js", // For dropdown : temporary
        "node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.js",
        "node_modules/bootstrap-select/dist/js/bootstrap-select.js",
        "node_modules/angular/angular.js",
        "node_modules/angular-ui-bootstrap/dist/ui-bootstrap.min.js",
        "node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js",
        "node_modules/angular-sanitize/angular-sanitize.min.js",
        "node_modules/angular-animate/angular-animate.min.js",
        "node_modules/angular-aria/angular-aria.min.js",
        "node_modules/@uirouter/angularjs/release/angular-ui-router.min.js",
        "node_modules/patternfly/dist/js/patternfly.js",
        "node_modules/angular-patternfly/node_modules/lodash/lodash.min.js",
        "node_modules/angular-patternfly/dist/angular-patternfly.js",
        "node_modules/c3-angular/c3-angular.min.js",
        "node_modules/bootstrap-switch/dist/js/bootstrap-switch.min.js",
        "node_modules/angular-bootstrap-switch/dist/angular-bootstrap-switch.min.js",
        "node_modules/angular-patternfly/node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js",
        "node_modules/datatables/media/js/jquery.dataTables.js",
        "node_modules/angular-patternfly/node_modules/angularjs-datatables/dist/angular-datatables.js"
    ])
    .pipe(uglify())
    .pipe(concat("libraries.js"))
    .pipe(gulp.dest(paths.dest + paths.jsLibraries));
});

//Copy css file of the dependent libraries 
gulp.task("cssLibraries", function() {
    return gulp.src([
        "node_modules/patternfly/dist/css/patternfly.css",
        "node_modules/patternfly/dist/css/patternfly-additions.css",
        "node_modules/angular-patternfly/styles/angular-patternfly.css",
        "node_modules/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css"
    ])
    .pipe(postCss([autoprefixer({ browsers: browsers })]))
    .pipe(buildMode === "dev" ? noop() : minifyCSS())
    .pipe(concat("libraries.css"))
    .pipe(gulp.dest(paths.dest + paths.cssLibraries));
});

//Copy all the application files to dist except js and css
gulp.task("copy", function() {
    var filesToCopy;

    filesToCopy = [filters.all, "!../package.json", "!" + filters.jscss];

    paths.htmlFiles.forEach(function(htmlFile) {
        //filesToCopy.push("!" + htmlFile);
    });

    return gulp.src(filesToCopy, { cwd: paths.src })
        .pipe(gulp.dest(paths.dest));
});

//Task to do eslint
gulp.task("eslint", function() {
    return gulp.src([filters.js], { cwd: paths.src })
        .pipe(eslint())
        .pipe(eslint.format("stylish"))
        .pipe(buildMode === "dev" ? noop() : eslint.failAfterError());
});

//Copy the files needed to load before the bootstraping of application
gulp.task("preload", ["eslint"], function() {

    return gulp.src(paths.preloads, { base: paths.src, cwd: paths.src })
        .pipe(concat("preload.jst", { newLine: ";" }))
        .pipe(buildMode === "dev" ? noop() : ngAnnotate())
        .pipe(buildMode === "dev" ? noop() : uglify())
        .pipe(gulp.dest(paths.dest + paths.preloadFolder));
});

//Compile the scss files
gulp.task("sass", function() {
    return gulp.src([paths.cssMain], { base: paths.src, cwd: paths.src })
        .pipe(sass())
        .pipe(cssimport({
            extensions: ["css"]
        }))
        .pipe(postCss([autoprefixer({ browsers: browsers })]))
        .pipe(buildMode === "dev" ? noop() : minifyCSS())
        .pipe(gulp.dest(paths.dest));
});

//Copy the resources(fonts etc) to dist folder
gulp.task("resource", function(done) {

    var streams = merge(),
        resources = Object.keys(paths.resources);

    if (resources.length > 0) {
        resources.forEach(function(resource) {
            var stream = gulp.src(resource, { cwd: paths.src })
                .pipe(gulp.dest(paths.dest + paths.resources[resource]));

            streams.add(stream);
        });

        return streams;
    } else {
        done();
    }

});

//bundle application js files in plugin-bundle.js and copy it to dist
gulp.task("jsbundle", ["eslint"], function() {

    return gulp.src(paths.jsFiles, { cwd: paths.src })
        .pipe(concat("plugin-bundle.js"))
        .pipe(buildMode === "dev" ? noop() : ngAnnotate())
        .pipe(buildMode === "dev" ? noop() : uglify())
        .pipe(gulp.dest(paths.dest));
});

//Establish watcher for js, css, html and copy the updated file to dist 
gulp.task("watcher", ["browser-sync", "common"], function(done) {

    var filesToCopy;

    filesToCopy = [filters.images, filters.html];

    paths.htmlFiles.forEach(function(htmlPath) {
        //filesToCopy.push("!" + htmlPath);
    });

    gulp.watch(filesToCopy, { cwd: paths.src }, function(event) {
        log("Modified:", colors.yellow(event.path));
        runSequence("copy");
    });

    gulp.watch(paths.htmlFiles, { cwd: paths.src }, function(event) {
        log("Modified:", colors.yellow(event.path));
    });

    gulp.watch(filters.js, { cwd: paths.src }, function(event) {
        log("Modified:", colors.yellow(event.path));
        runSequence("preload", "jsbundle");
    });

    gulp.watch([filters.css, filters.scss], { cwd: paths.src }, function(event) {
        log("Modified:", colors.yellow(event.path));
        runSequence("sass");
    });

    done();

});

gulp.task("browser-sync", ["common"], function() {
    bs.init({
        server: {
            baseDir: paths.dest,
            middleware: [historyApiFallback()]

        },
        //proxy: "localhost:8080",
        files: ["dist/**/*.*"],
        reloadDebounce: 500
    });
});

//Run the unit tests
gulp.task("ut", function(done) {
    var config = {
        configFile: __dirname + "/karma.conf.js",
        singleRun: true
    };
    new KarmaServer(config, done).start();
});

// Common task
gulp.task("common", ["eslint", "jsLibraries", "cssLibraries", "resource", "copy", "preload", "sass", "jsbundle"]);

// dev mode task
gulp.task("dev", ["common", "watcher"], function(done) {
    log(colors.bold(colors.yellow("Watchers Established. You can now start coding")));
});

// production mode task
gulp.task("release", ["common"], function(done) {
    runSequence("ut", done);
});

//default task is common
gulp.task("default", ["common"]);