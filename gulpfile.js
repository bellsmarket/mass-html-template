var gulp    = require('gulp'),
    sass    = require('gulp-sass')(require('sass')),
    connect = require('gulp-connect'),
    plumber = require('gulp-plumber'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    ejs = require("gulp-ejs");

var path = require('path');
var fs = require('fs')


// Input Directory
var srcPath = {
  'ejs': ['src/**/*.ejs', '!' + 'src/**/_*.ejs'],
  'css': 'src/**/*.css',
  'sass': 'src/**/*.scss',
  'js': 'src/**/*.js',
  'json': 'src/_data/',
};

// Output Directory
var destPath = {
  'root': './dist',
  'html': './dist'
};


function reload(done) {
  connect.server({
    livereload: true,
    port: 8080
  });
  done();
}


function ejs(done) {
  return gulp
    //.src(["src/ejs/**/*.ejs"])
    .src([srcPath.ejs])
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(destPath.html));
}


function html() {
  return (
    gulp.src(destPath + '/*.html')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(connect.reload())
  );
}

// sass => css Compile
function sass() {
  return (
    gulp.src(srcPath.sass + 'styles.scss')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest(destPath + 'assets/css'))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest(destPath + 'assets/css'))
    .pipe(connect.reload())
  );
}

// js Compile
function js() {
  return (
    gulp.src(srcPath.js + 'scripts.js')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(uglify())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('./dist/assets/js'))
    .pipe(connect.reload())
  );
}


// gulp.watch(file, func)
function watchTask() {
  gulp.watch('*.html', html);
  gulp.watch(srcPath.sass + '/**/*.scss', sass);
  gulp.watch('src/js/scripts.js', js);
//  gulp.watch('src/pug/pages/**/*.pug', views);
}

watchTask();

const watch = gulp.parallel(watchTask, reload);
//const build = gulp.series(gulp.parallel(sass, js, html, views));
const build = gulp.series(gulp.parallel(sass, js, html));

exports.reload = reload;
exports.ejs = ejs;
exports.html = html;
exports.sass= sass;
exports.js = js;
//exports.views = views;

exports.watch = watch;
exports.build = build;
exports.default = watch;

