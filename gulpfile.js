var gulp    = require('gulp'),
    sass    = require('gulp-sass')(require('sass')),
    connect = require('gulp-connect'),
    plumber = require('gulp-plumber'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    changed = require('gulp-changed'),
    cached = require('gulp-cached'),
    gulpejs = require("gulp-ejs");


var htmlbeautify = require("gulp-html-beautify");
var path = require('path');
var fs = require('fs');


// Input Directory
var srcPath = {
  'ejs': ['src/ejs/**/*.ejs', '!' + 'src/ejs/**/_*.ejs'],
  'css': 'src/**/*.css',
  'sass': 'src/sass/*.scss',
  'js': 'src/js/*.js',
  'json': 'src/_data/',
};

// Output Directory
var destPath = {
  'root': './dist',
  'html': './dist',
  'ejs': './dist',
  'css': './dist/assets/css',
  'sass': './dist/assets/scss',
  'js': './dist/assets/js',
};


function reload(done) {
  connect.server({
    livereload: true,
    port: 8080
  });
  done();
}

function html() {
  return (
    gulp.src('./dest/*.html')
    .pipe(plumber())
    .pipe(connect.reload())
  );
}

function styles() {
  return (
    gulp.src(srcPath.sass)
    .pipe(sourcemaps.init())
    .pipe(cached('sass'))
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destPath.css))
    // .pipe(sass({outputStyle: 'compressed'}))
    // .pipe(rename('styles.min.css'))
    // .pipe(sourcemaps.write('./'))
    // .pipe(gulp.dest(destPath.css))
    .pipe(connect.reload())
  );
}

function scripts() {
  return (
    gulp.src(srcPath.js)
      .pipe(cached('scripts'))
      .pipe(plumber())
      .pipe(gulp.dest(destPath.js))
      .pipe(uglify())
      .pipe(rename({extname: '.min.js'}))
      .pipe(gulp.dest(destPath.js))
      .pipe(connect.reload())
  );
}

// gulp.task('ejs', function(done) {
//   return gulp.src(srcPath.ejs)
//     // .pipe(cached('ejs'))
//     .pipe(changed('ejs'))
//     .pipe(plumber())
//     .pipe(ejs({title: 'gulp-ejs'}))
//     .pipe(
//       htmlbeautify({
//         indent_size: 2, //インデントサイズ
//         indent_char: " ", // インデントに使う文字列はスペース1こ
//         max_preserve_newlines: 0, // 許容する連続改行数
//         preserve_newlines: false, //コンパイル前のコードの改行
//         indent_inner_html: false, //head,bodyをインデント
//         extra_liners: [], // 終了タグの前に改行を入れるタグ。配列で指定。head,body,htmlにはデフォで改行を入れたくない場合は[]。
//       })
//     )
//     .pipe(rename({ extname: '.html' }))
//     .pipe(gulp.dest(destPath.ejs));
//   done();
// });


function ejs() { 
  return gulp.src(srcPath.ejs)
    .pipe(changed('ejs'))
    .pipe(plumber())
    .pipe(gulpejs({ title: 'gulp-ejs' }))
    .pipe(
      htmlbeautify({
        indent_size: 2, 
        indent_char: " ", 
        max_preserve_newlines: 0, 
        preserve_newlines: false, //コンパイル前のコードの改行
        indent_inner_html: false, //head,bodyをインデント
        extra_liners: [], // 終了タグの前に改行を入れるタグ。配列で指定。head,body,htmlにはデフォで改行を入れたくない場合は[]。
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(destPath.ejs));
}

// function compileEjs() { 
//   return gulp.src(srcPath.ejs)
//     .pipe(ejs({ title: 'gulp-ejs' }))
//     .pipe(rename({ extname: '.html' }))
//     .pipe(gulp.dest(destPath.ejs));
// }


// gulp.watch(ファイル, 処理)
function watchTask(done) {
  // gulp.watch('*.html', html);
  gulp.watch('src/sass/**/*.scss', styles);
  gulp.watch('src/js/**/*.js', scripts);
  gulp.watch(srcPath.ejs, ejs);
  // gulp.watch(srcPath.ejs, gulp.task("ejs"));
  
  done();
}


var watch = gulp.parallel(watchTask, reload);
// var build = gulp.series(gulp.parallel(styles, scripts, gulp.task("ejs")));
// var build = gulp.series(gulp.parallel(styles, scripts, compileEjs));
var build = gulp.series(gulp.parallel(styles, scripts, ejs));

exports.reload = reload;
// exports.compile = compileEjs;
exports.ejs = ejs;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.watch = watch;
exports.build = build;
exports.default = watch;

