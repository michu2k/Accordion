const gulp         = require('gulp');
const sass         = require('gulp-sass');
const babel        = require('gulp-babel');
const cleanCSS     = require('gulp-clean-css');
const uglify       = require('gulp-uglify');
const browserSync  = require('browser-sync').create();
const rename       = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const prettier     = require('gulp-prettier');

// Config
const config = {
  srcCSS: 'src/**/*.scss',
  distCSS: 'dist',
  srcJS: 'src/**/*.js',
  distJS: 'dist'
}

// Server
function server() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
}

// Server reload
function reload(done) {
  browserSync.reload();
  done();
}

// Sass
function compileSass() {
  return gulp.src(config.srcCSS)
    .pipe(sass({outputStyle: 'expanded'})
    .on('error', sass.logError))
    .pipe(autoprefixer({cascade: false}))
    .pipe(gulp.dest(config.distCSS))
    .pipe(browserSync.stream())
    .pipe(cleanCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(config.distCSS))
    .pipe(browserSync.stream());
}

// Javascript
function compileJs() {
  return gulp.src(config.srcJS)
    .pipe(babel({
      presets: ['@babel/preset-env'],
      retainLines: true
    }))
    .on('error', function(error) {
      console.log(error.toString())
      this.emit('end')
    })
    .pipe(prettier({
      printWidth: 120,
      singleQuote: true
    }))
    .pipe(gulp.dest(config.distJS)) 
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(config.distJS))
    .pipe(browserSync.stream());
}

// Watch Sass files
function watchSass() {
  gulp.watch(config.srcCSS, gulp.series(compileSass, reload));   
}

// Watch Javascript files
function watchJs() {
  gulp.watch(config.srcJS, gulp.series(compileJs, reload));   
}

// Watch HTML files
function watchHtml() {
  gulp.watch('*.html', gulp.series(reload));
}

// Main task
gulp.task('default', gulp.parallel(server, watchSass, watchJs, watchHtml));