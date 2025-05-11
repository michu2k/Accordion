import {src, dest, watch, series, task, parallel} from "gulp";
import babel from "gulp-babel";
import cleanCSS from "gulp-clean-css";
import terser from "gulp-terser";
import rename from "gulp-rename";
import autoprefixer from "gulp-autoprefixer";
import headerComment from "gulp-header-comment";
import browserSync from "browser-sync";

const header = `
Accordion v3.4.1
<%= pkg.description %>
https://github.com/michu2k/Accordion

Copyright (c) <%= pkg.author %>
Published under <%= pkg.license %> License
`;

// Config
const config = {
  srcCSS: "src/**/*.css",
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

// CSS
function compileCSS() {
  return src(config.srcCSS)
    .pipe(rename({suffix: ".min"}))
    .pipe(autoprefixer({cascade: false}))
    .pipe(cleanCSS())
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

// Watch CSS files
function watchCSS() {
  watch(config.srcCSS, series(compileCSS, reload));
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
task("default", parallel(server, watchCSS, watchJs, watchHtml));
