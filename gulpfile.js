var gulp          = require('gulp'),
    sass          = require('gulp-sass')(require('sass')),
    connect       = require('gulp-connect'),
    plumber       = require('gulp-plumber'),
    notify        = require('gulp-notify'),
    rename        = require('gulp-rename'),
    uglify        = require('gulp-uglify'),
    autoprefixer  = require('gulp-autoprefixer'),
    sourcemaps    = require('gulp-sourcemaps'),
    changed       = require('gulp-changed'),
    cached        = require('gulp-cached'),
    gulpejs       = require('gulp-ejs'),
    htmlbeautify  = require('gulp-html-beautify'),
    eslint        = require('gulp-eslint'),
    scsslint      = require('gulp-scss-lint');

var path          = require('path');
var fs            = require('fs');


// Input Directory
var srcPath = {
  'ejs': ['src/ejs/**/*.ejs', '!' + 'src/ejs/**/_*.ejs'],
  'css': 'src/**/*.css',
  'sass': 'src/sass/*.scss',
  'js': 'src/js/*.js',
  'json': 'src/_data/site.json',
};

const option = {
  ejs: {
    src: ['src/ejs/**/*.ejs', '!' + 'src/ejs/**/_*.ejs'],
    dist: './dist'
  }
};


// const options = {
//   css : {
//     src : '**/css/**/*.scss',
//     dist: './'
//   },
//
//   sass : {
//     //notifyのエラーを表示させるためfalseに
//     errLogToConsole: false,
//     //css圧縮
//     // outputStyle: 'expanded'
//     outputStyle: 'compressed'
//   }
// }


// Output Directory
var destPath = {
  'root': './dist/',
  'html': './dist',
  'ejs': './dist',
  'css': './dist/assets/css',
  'sass': './dist/assets/scss',
  'js': './dist/assets/js',
};


function reload(done) {
  connect.server({
    root: destPath.root,
    livereload: true,
    port: 8080
  });
  done();
}

function html() {
  return gulp.src('./dest/*.html')
    .pipe(plumber())
    .pipe(connect.reload());
}


// ソースマップの下記の書き方を踏襲し移植予定
// .src([options.css.src, '!node_modules/**'],{ sourcemaps: true })

function styles() {
  return gulp.src(srcPath.sass)
    .pipe(sourcemaps.init())
    // .pipe(cached('sass'))
    // .pipe(scsslint({ 'maxBuffer': 10000 }) )
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'scss Compile Failed', // 任意のタイトルを表示させる
        message: '<%= error.message %>' // エラー内容を表示させる
      })
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destPath.css));
}


function scripts() {
  return gulp.src(srcPath.js)
    .pipe(cached('scripts'))
    .pipe(plumber({
      errorHandler: notify.onError({
        message: 'Error: <%= error.message %>',
        title: 'scripts'
      })
    }))
    .pipe(gulp.dest(destPath.js))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(destPath.js));
}

function checkJs() {
  return gulp.src(srcPath.js) // lint のチェック先を指定
    .pipe(plumber({
      // エラーをハンドル
      errorHandler: function(error) {
        var taskName = 'eslint';
        var title = '[task]' + taskName + ' ' + error.plugin;
        var errorMsg = 'error: ' + error.message;
        // ターミナルにエラーを出力
        console.error(title + '\n' + errorMsg);
        // エラーを通知
        notify.notify({
          title: title,
          message: errorMsg,
          time: 3000
        });
      }
    }))
    .pipe(eslint({ useEslintrc: true })) // .eslintrc を参照
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(plumber.stop());
}


function ejs() {
  var json = JSON.parse(fs.readFileSync(srcPath.json));

  return gulp.src(srcPath.ejs)
    .pipe(changed('ejs'))
    .pipe(plumber({
      errorHandler: notify.onError({
        message: 'Error: <%= error.message %>',
        title: 'ejs'
      })
    }))
    .pipe(gulpejs({
      title: 'gulp-ejs',
      jsonData: json
     }))
    .pipe(
      htmlbeautify({
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 0,
        preserve_newlines: false, //コンパイル前のコードの改行
        indent_inner_html: false, //head,bodyをインデント
        extra_liners: [], // 終了タグの前に改行を入れるタグ。配列で指定。head,body,htmlにはデフォで改行を入れたくない場合は[]。
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(destPath.ejs));
}


// gulp.watch(ファイル, 処理)
function watchTask(done) {
  gulp.watch('*.html', html);
  gulp.watch('src/sass/**/*.scss', styles);
  gulp.watch('src/js/**/*.js', scripts);
  gulp.watch(srcPath.ejs, ejs);
  gulp.watch(srcPath.js, checkJs);
  done();
}


var watch = gulp.parallel(watchTask, reload);
var build = gulp.series(gulp.parallel(styles, scripts, ejs));

exports.reload = reload;
exports.html = html;
exports.ejs = ejs;
exports.checkJs = checkJs;
exports.styles = styles;
exports.scripts = scripts;
exports.build = build;
exports.watch = watch;
exports.default = watch;
