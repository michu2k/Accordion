import {src, dest, watch, series, task, parallel} from "gulp";
import babel from "gulp-babel";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import rename from "gulp-rename";
import autoprefixer from "gulp-autoprefixer";
import headerComment from "gulp-header-comment";
import browserSync from "browser-sync";
import dartSass from "sass";
import gulpSass from "gulp-sass";

const sass = gulpSass(dartSass);

const header = `
Accordion v3.3.4
<%= pkg.description %>
https://github.com/michu2k/Accordion

Copyright (c) <%= pkg.author %>
Published under <%= pkg.license %> License
`;

// Config
const config = {
  srcCSS: "src/**/*.scss",
  distCSS: "dist",
  srcJS: "src/**/*.js",
  distJS: "dist"
};

// Server
function server() {
  browserSync.init({
    server: {
      baseDir: "./"
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
  return src(config.srcCSS)
    .pipe(
      sass({
        outputStyle: "expanded"
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer({cascade: false}))
    .pipe(headerComment(header))
    .pipe(dest(config.distCSS))
    .pipe(browserSync.stream())
    .pipe(cleanCSS())
    .pipe(rename({suffix: ".min"}))
    .pipe(headerComment(header))
    .pipe(dest(config.distCSS))
    .pipe(browserSync.stream());
}

// Javascript
function compileJs() {
  return src(config.srcJS)
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
        retainLines: true
      })
    )
    .on("error", function (error) {
      console.log(error.toString());
      this.emit("end");
    })
    .pipe(
      terser({
        ecma: 2020
      })
    )
    .pipe(rename({suffix: ".min"}))
    .pipe(headerComment(header))
    .pipe(dest(config.distJS))
    .pipe(browserSync.stream());
}

// Watch Sass files
function watchSass() {
  watch(config.srcCSS, series(compileSass, reload));
}

// Watch Javascript files
function watchJs() {
  watch(config.srcJS, series(compileJs, reload));
}

// Watch HTML files
function watchHtml() {
  watch("*.html", series(reload));
}

// Main task
task("default", parallel(server, watchSass, watchJs, watchHtml));
