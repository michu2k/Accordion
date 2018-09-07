var gulp         = require('gulp');
var sass         = require('gulp-sass');
var babel        = require('gulp-babel');
var cleanCSS     = require('gulp-clean-css');
var uglify       = require('gulp-uglify');
var browserSync  = require('browser-sync');
var rename       = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');

// Config
var config = {
    srcCSS: 'src/**/*.scss',
    distCSS: 'dist',
    srcJS: 'src/**/*.js',
    distJS: 'dist'
}

// Browser Sync
gulp.task('browser-sync', function() {
    browserSync({
        server: './'
    });
});

// Javascript
gulp.task('js', function() {
    return gulp.src(config.srcJS)
        .pipe(babel())
        .pipe(gulp.dest(config.distJS)) 
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.distJS))
        .pipe(browserSync.stream());
});

// Sass
gulp.task('sass', function() {
    return gulp.src(config.srcCSS)
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                'Chrome >= 30',
                'Firefox >= 26',
                'Edge >= 12',
                'Explorer >= 10',
                'Opera >= 26',
                'iOS >= 7.1',
                'Safari >= 8',
                'Android >= 4.3'
            ],
            cascade: false
        }))
        .pipe(gulp.dest(config.distCSS))
        .pipe(browserSync.stream())
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.distCSS))
        .pipe(browserSync.stream());
});

// Main task
gulp.task('run', ['browser-sync', 'sass', 'js'], function() {
    gulp.watch(config.srcCSS, ['sass']);
    gulp.watch(config.srcJS, ['js']);
    gulp.watch('*.html', browserSync.reload);
});

gulp.task('default', ['run']);