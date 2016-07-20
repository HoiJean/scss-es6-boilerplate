'use strict';

var _ = require('lodash'),
  gulp = require('gulp'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  bowerResolve = require('bower-resolve'),
  nodeResolve = require('resolve'),
  babelify = require("babelify"),
  buffer = require('vinyl-buffer'),
  browserSync = require('browser-sync').create(),
  autoprefixer = require('gulp-autoprefixer'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  cssnano = require('gulp-cssnano'),
  sourcemaps = require('gulp-sourcemaps'),
  gutil = require('gulp-util'),
  modernizr = require('gulp-modernizr'),
  eslint = require('gulp-eslint'),
  del = require('del'),
  runSequence = require('run-sequence'),
  es = require('event-stream'),
  scsslint = require('gulp-scss-lint');

// js linter
gulp.task('linter', function() {
  return gulp
  .src("es6/**/*.js")
  .pipe(eslint())
  .pipe(eslint.format());
});

// sass linter
gulp.task('scss-lint', function() {
  return gulp
  .src('scss/**/*.scss')
  .pipe(scsslint({
    'config': 'lint.yml',
  }));
});

// sass compile
gulp.task('sass', function () {
  return gulp
  .src('scss/**/*.scss')
  .pipe(gutil.env.type !== 'production' ? sourcemaps.init({loadMaps: true}) : gutil.noop())
  .pipe(sass())
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer('last 2 versions'))
  .pipe(concat('site.css'))
	.pipe(gutil.env.type === 'production' ? cssnano() : gutil.noop())
  .pipe(gutil.env.type !== 'production' ? sourcemaps.write('/maps') : gutil.noop())
	.pipe(gulp.dest('app/css'))
  .pipe(browserSync.stream({match: '**/*.css'}));
});

// use browserify to build a vendor.js and an app.js
gulp.task('build-vendor', function () {

  // this task will go through ./bower.json and
  // uses bower-resolve to resolve its full path.
  // the full path will then be added to the bundle using require()

  var b = browserify({
    // generate source maps in non-production environment
    debug: (gutil.env.type !== 'production')
  });

  // get all bower components ids and use 'bower-resolve' to resolve
  // the ids to their full path, which we need for require()
  getBowerPackageIds().forEach(function (id) {

    var resolvedPath = bowerResolve.fastReadSync(id);

    b.require(resolvedPath, {

      // exposes the package id, so that we can require() from our code.
      expose: id

    });
  });

  // npm packages - resolve path using 'resolve' module
  getNPMPackageIds().forEach(function (id) {
    b.require(nodeResolve.sync(id), { expose: id });
  });

  var stream = b
    .bundle()
    .on('error', function(err){
      // print the error
      gutil.log(err.message);
      // end this stream
      this.emit('end');
    })
    .pipe(source('vendor.js'))
    .pipe(buffer());

  // custom modernizr build
  var modernizrBuild = gulp.src("es6/**/*.js")
    .pipe(modernizr('modernizr.custom.js', {
      options: ['setClasses', 'addTest', 'html5printshiv', 'testProp', 'fnBind'],
      tests:['matchmedia']
  }));

  // merge modernizr with the stream
  return es.merge(modernizrBuild, stream)
    .pipe(concat('vendor.js'))
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(gulp.dest('./app/js'));

});

gulp.task('build-app', function () {
  var extensions = ['.js','.json','.es6'];

  var b = browserify('./es6/app.js', {
    // generate source maps in non-production environment
    debug: (gutil.env.type !== 'production'),
    extensions: extensions
  });

  // mark vendor libraries defined in bower.json as an external library,
  // so that it does not get bundled with app.js.
  getBowerPackageIds().forEach(function (lib) {
    b.external(lib);
  });


  // do the similar thing, but for npm-managed modules.
  // resolve path using 'resolve' module
  getNPMPackageIds().forEach(function (id) {
    b.external(id);
  });


  var stream = b
  .transform(babelify.configure({
    extensions: extensions
  }))
  .bundle()
  .pipe(source('app.js'))
  .pipe(buffer())
  .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop());

  stream.pipe(gulp.dest('./app/js')).pipe(browserSync.stream({match: '**/*.js'}));

  return stream;

});

/**
 * Helper function(s)
 */

function getBowerPackageIds() {
  // read bower.json and get dependencies' package ids
  var bowerManifest = {};
  try {
    bowerManifest = require('./bower.json');
  } catch (e) {
    // does not have a bower.json manifest
  }
  return _.keys(bowerManifest.dependencies) || [];

}

function getNPMPackageIds() {
  // read package.json and get dependencies' package ids
  var packageManifest = {};
  try {
    packageManifest = require('./package.json');
  } catch (e) {
    // does not have a package.json manifest
  }
  return _.keys(packageManifest.dependencies) || [];

}

// use gulp watch
gulp.task('watch', ['build-vendor', 'build-app', 'linter', 'sass', 'scss-lint'], function () {
  browserSync.init({
    injectChanges: true,
    server: "./app"
  });
  gulp.watch('scss/**/*.scss', ['sass']);
  gulp.watch('es6/**/*.js', ['build-app']);
  gulp.watch("app/**/*.html").on('change', browserSync.reload);
});

// tasks for distribution of html/js/css/json

gulp.task('dist-ajax', function() {
  return gulp
  .src('./app/ajax/*.json')
  .pipe(gulp.dest('./dist/ajax'))
});

gulp.task('dist-html', function() {
  return gulp
  .src('./app/*.html')
  .pipe(gulp.dest('./dist'))
});

gulp.task('dist-js', function() {
  return gulp
  .src('./app/js/**/*.js')
  .pipe(gulp.dest('./dist/js'))
});

gulp.task('dist-css', function() {
  return gulp
  .src('./app/css/**/*.css')
  .pipe(gulp.dest('./dist/css'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

// build distribution
gulp.task('dist', ['dist-js', 'dist-css', 'dist-html', 'dist-ajax']);

// use gulp --type production
gulp.task('default', function (dist) {
  runSequence('clean:dist',
    ['build-vendor', 'build-app'],
    ['sass'],
    'dist'
  )
});
