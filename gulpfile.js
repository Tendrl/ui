var argv = require('yargs').argv;
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var debug = require('gulp-debug');
var gulpif = require('gulp-if');
var tslint = require('gulp-tslint');
var tsc = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var merge = require('merge-stream');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var del = require('del');
//var es = require('event-stream');
//var bowerFiles = require('main-bower-files');
//var print = require('gulp-print');
//var Q = require('q');
var tscProject = tsc.createProject('tsconfig.json', { typescript: require('typescript') });

var path = {
    tscripts: './app/**/*.ts',
    scripts: './app/components/**/*.js',
    styles: ['app/styles/main.scss'],
    index: 'app/index.html',
    partials: ['app/components/**/*.html', '!app/index.html'],
    tsdist: 'app',
    dist: 'dist'
};

var config = {
    appconfig: {
        src: ['./app/config/config.json'],
        dest: 'dist/config'
    },
    fonts: {
        patternfly: {
            src: ['./node_modules/patternfly/dist/fonts/*.*', './node_modules/font-awesome/fonts/*.*'],
            dest: 'dist/fonts'
        },
        fontawesome: {
            src: ['./node_modules/patternfly/components/font-awesome/fonts/*.*'],
            dest: 'dist/components/font-awesome/fonts'
        }
    },
    images: {
        src: ['./app/images/*.*'],
        dest: 'dist/images'
    },
    css: {
        vendor: {
            src: [
                './node_modules/patternfly/dist/css/patternfly.css',
                './node_modules/patternfly/dist/css/patternfly-additions.css', './node_modules/angular-patternfly/styles/angular-patternfly.css',
                './node_modules/angular-bootstrap-datetimepicker/src/css/datetimepicker.css'
            ],
            dest: 'dist/css'
        }
    },
    templates: {
        src: ['./node_modules/angular-bootstrap-datetimepicker/src/templates/datetimepicker.html'],
        dest: 'dist/templates'
    }
}

gulp.task('tslint', function () {
    return gulp.src('app/*.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'))
});

gulp.task('tsc', function () {
    return gulp.src(path.tscripts)
        .pipe($.sourcemaps.init())
        .pipe(tsc(tscProject))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(path.tsdist));
});

//tsc needs to be completed before browserify
//https://github.com/gulpjs/gulp/issues/96#issuecomment-33512519
gulp.task('browserify', ['tsc'], function () {
    return browserify({ entries: './app/app.js', debug: true })
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(ngAnnotate())
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(gulp.dest(path.dist + '/scripts'));
});

gulp.task('sass', function () {
    return gulp.src(path.styles)
        .pipe($.sourcemaps.init())
        .pipe(sass())
        .pipe($.concat('tendrl.css'))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(path.dist + '/css'));
});

//Copy css to dist/css
gulp.task('css', function () {
    return gulp.src(config.css.vendor.src)
        .pipe(gulp.dest(config.css.vendor.dest));
});

//Copy templates to dist/templates
gulp.task('templates', function () {
    return gulp.src(config.templates.src)
        .pipe(gulp.dest(config.templates.dest));
});

//Copy config to dist/config
gulp.task('config', function () {
    return gulp.src(config.appconfig.src)
        .pipe(gulp.dest(config.appconfig.dest));
});

//Copy the fonts to dist/fonts
gulp.task('fonts', function () {
    var patternfly = gulp.src(config.fonts.patternfly.src)
        .pipe(gulp.dest(config.fonts.patternfly.dest));
    var fontawesome = gulp.src(config.fonts.fontawesome.src)
        .pipe(gulp.dest(config.fonts.fontawesome.dest));
    return merge(patternfly, fontawesome);
});

//Copy the images to dist/images
gulp.task('images', function () {
    return gulp.src(config.images.src)
        .pipe(gulp.dest(config.images.dest));
});

gulp.task('html', function () {
    //Copy the partial html files to dist
    return gulp.src(path.partials)
        .pipe(gulp.dest(path.dist + '/views'));
});

gulp.task('inject', ['browserify', 'sass', 'css', 'html'], function () {
    //Copy index.html to dist and inject css/js
    return gulp.src(path.index)
        .pipe(gulp.dest(path.dist))
        .pipe($.inject(gulp.src([path.dist + '/css/*.css', path.dist + '/scripts/*.js']), { relative: true }))
        .pipe(gulp.dest(path.dist));
});


gulp.task('compile', ['tslint', 'tsc', 'browserify', 'sass', 'css', 'templates', 'config', 'fonts', 'html', 'inject', 'images']);

gulp.task('watch', function () {
    gulp.watch(path.tscripts, ['browserify']);
    gulp.watch(path.styles, ['sass']);
});

gulp.task('clean', function () {
    del(path.scripts);
    del(path.dist);
});
