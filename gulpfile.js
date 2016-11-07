/* global require */
/* global process */

// Gulp specific
var gulp = require("gulp");
var gzip = require("gulp-gzip");
var tar = require("gulp-tar");
var concat = require("gulp-concat");
var runSequence = require("run-sequence");
var rename = require("gulp-rename");

// Logger modules
var gutil = require("gulp-util");
var colors = gutil.colors;

// File handling related modules
var del = require("del");
var fs = require("fs");

// Stream related modules
var merge = require("merge-stream");
var through2 = require("through2");

// Network modules
var request = require("request");

// CSS, SASS and styling related modules
var cssimport = require("gulp-cssimport");
var sass = require("gulp-sass");
var minifyCSS = require("gulp-minify-css");
var autoprefixer = require("autoprefixer-core");
var postCss = require("gulp-postcss");

// JavaScript related modules
var eslint = require("gulp-eslint");
var uglify = require("gulp-uglify");

// Angular.js specific modules
var ngAnnotate = require("gulp-ng-annotate");

// Testing related modules
var KarmaServer = require("karma").Server;

// Local variables
var pkg = require("./package.json");
var pluginOpts = pkg.TendrlProps;
var archiveName = pkg.name + "." + pkg.version + pluginOpts.archiveExtension;
var buildMode = process.argv[2] || "release";
var browsers = pluginOpts.targetBrowsers;

// System wide paths
var paths = (function () {

    var src = "./src/";

    return {
        src: src,
        build: pluginOpts.buildDestination,
        dest: pluginOpts.buildDestination + pkg.name + "/",
        preloads: pluginOpts.preloads,
        preloadFolder: "preload/",
        jsLibraries: "jsLibraries/",
        cssLibraries: "cssLibraries/",
        cssMain: pluginOpts.cssMain,
        jsFiles: pluginOpts.jsFiles,
        htmlFiles: pluginOpts.htmlFiles,
        resources: pluginOpts.resources,
        appconfig: "config/",
        config: pluginOpts.config
    };
})();

// File selection filters
var filters = (function () {
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

//Copy config to dist/config
gulp.task('config', function () {
    return gulp.src(paths.config)
        .pipe(gulp.dest(paths.dest + paths.appconfig));
});

gulp.task("jsLibraries", function() {
  return gulp.src([
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/angular/angular.js",
    "node_modules/angular-animate/angular-animate.min.js",
    "node_modules/angular-aria/angular-aria.min.js",
    "node_modules/angular-ui-router/release/angular-ui-router.js",
    "node_modules/patternfly/dist/js/patternfly.js",
    "node_modules/angular-patternfly/dist/angular-patternfly.js",
  ])
  //.pipe(uglify())
  .pipe(concat("libraries.js"))
  .pipe(gulp.dest(paths.dest + paths.jsLibraries));
});

gulp.task("cssLibraries", function() {
  return gulp.src([
    "node_modules/patternfly/dist/css/patternfly.css",
    "node_modules/patternfly/dist/css/patternfly-additions.css",
    "node_modules/angular-patternfly/styles/angular-patternfly.css"
  ])
  .pipe(postCss([autoprefixer({ browsers: browsers })]))
  .pipe(buildMode === "dev" ? gutil.noop() : minifyCSS())
  .pipe(concat("libraries.css"))
  .pipe(gulp.dest(paths.dest + paths.cssLibraries));
});

gulp.task("copy", function () {
    var filesToCopy;

    filesToCopy = [filters.all, "../package.json", "!" + filters.jscss];

    paths.htmlFiles.forEach(function (htmlFile) {
        //filesToCopy.push("!" + htmlFile);
    });

    return gulp.src(filesToCopy, { cwd: paths.src })
        .pipe(gulp.dest(paths.dest));
});

gulp.task("eslint", function () {
    return gulp.src([filters.js], { cwd: paths.src })
        .pipe(eslint())
        .pipe(eslint.format("stylish"))
        .pipe(buildMode === "dev" ? gutil.noop() : eslint.failAfterError());
});

gulp.task("preload", ["eslint"], function () {

    return gulp.src(paths.preloads, { base: paths.src, cwd: paths.src })
        .pipe(concat("preload.jst", { newLine: ";" }))
        .pipe(buildMode === "dev" ? gutil.noop() : ngAnnotate())
        .pipe(buildMode === "dev" ? gutil.noop() : uglify())
        .pipe(gulp.dest(paths.dest + paths.preloadFolder));
});

gulp.task("sass", function () {
    return gulp.src([paths.cssMain], { base: paths.src, cwd: paths.src })
        .pipe(sass())
        .pipe(cssimport({
            extensions: ["css"]
        }))
        .pipe(postCss([autoprefixer({ browsers: browsers })]))
        .pipe(buildMode === "dev" ? gutil.noop() : minifyCSS())
        .pipe(gulp.dest(paths.dest));
});

gulp.task("resource", function (done) {

    var streams = merge(),
        resources = Object.keys(paths.resources);

    if (resources.length > 0) {
        resources.forEach(function (resource) {
            var stream = gulp.src(resource, { cwd: paths.src })
                .pipe(gulp.dest(paths.dest + paths.resources[resource]));

            streams.add(stream);
        });

        return streams;
    } else {
        done();
    }

});

gulp.task("jsbundle", ["eslint"], function () {

    return gulp.src(paths.jsFiles, { cwd: paths.src })
        .pipe(concat("plugin-bundle.js"))
        .pipe(buildMode === "dev" ? gutil.noop() : ngAnnotate())
        .pipe(buildMode === "dev" ? gutil.noop() : uglify())
        .pipe(gulp.dest(paths.dest));
});

gulp.task("watcher", function (done) {

    var filesToCopy;

    filesToCopy = [filters.images, filters.html];

    paths.htmlFiles.forEach(function (htmlPath) {
        //filesToCopy.push("!" + htmlPath);
    });

    gulp.watch(filesToCopy, { cwd: paths.src }, function (event) {
        gutil.log("Modified:", colors.yellow(event.path));
        runSequence("copy", "zip", "upload");
    });

    gulp.watch(paths.htmlFiles, { cwd: paths.src }, function (event) {
        gutil.log("Modified:", colors.yellow(event.path));
        runSequence("zip", "upload");
    });

    gulp.watch(filters.js, { cwd: paths.src }, function (event) {
        gutil.log("Modified:", colors.yellow(event.path));
        runSequence("preload", "jsbundle", "zip", "upload");
    });

    gulp.watch([filters.css, filters.scss], { cwd: paths.src }, function (event) {
        gutil.log("Modified:", colors.yellow(event.path));
        runSequence("sass", "zip", "upload");
    });

    done();

});

gulp.task("ut", function (done) {
    var config = {
        configFile: __dirname + "/karma.conf.js",
        singleRun: true
    };
    new KarmaServer(config, done).start();
});

// Compress task
gulp.task("compress", ["common"], function (done) {
    runSequence("zip", done);
});

gulp.task("zip", function () {

    gutil.log("Building package: ", colors.red(archiveName));

    return gulp.src([paths.build + "**/**.*"], {
        buffer: false
    })
        .pipe(tar(archiveName))
        .pipe(gzip({
            append: false
        }))
        .pipe(gulp.dest(".").on("finish", function () {
            gutil.log(colors.bold("Package built"));
        }));
});

// Just plain vanilla upload
gulp.task("upload", function () {

    var fileToUpload = "./" + archiveName;

    gutil.log("Uploading package to SERVER");
    gutil.log(colors.bold.green("PACKAGE UPLOADED SUCCESSFULLY"));

});

// Common task
gulp.task("common", ["eslint", "jsLibraries", "cssLibraries", "resource", "copy", "preload", "sass", "jsbundle"]);

// dev mode task
gulp.task("dev", ["common", "compress", "watcher"], function (done) {
    gutil.log(colors.bold.yellow("Watchers Established. You can now start coding"));
    runSequence("upload", done);
});

// production mode task
gulp.task("release", ["common", "compress"], function (done) {
    runSequence("ut", "upload", done);
});

gulp.task("default", ["release"]);
