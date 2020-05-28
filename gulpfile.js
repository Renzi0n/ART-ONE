"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require('gulp-csso');
var rename = require("gulp-rename");
var del = require("del");
var imagemin = require("gulp-imagemin");
var htmlmin = require("gulp-htmlmin");
var concat = require('gulp-concat');
var jsmin = require('gulp-jsmin');
var server = require("browser-sync").create();
var webp = require('gulp-webp');
var ghPages = require('gulp-gh-pages');

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/*.{png, jpg, svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task('convert', () =>
    gulp.src('source/img/*.jpg')
        .pipe(webp())
        .pipe(gulp.dest('source/img'))
);

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
    return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/*.{jpg,png,svg,webp}",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
    return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/*.{jpg,png,svg,webp}",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task('htmlminify', function () {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task('js', function () {
  return gulp.src("source/js/*.js")
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("build/js"))
    .pipe(server.stream());
});

gulp.task("copy-image", function () {
    return gulp.src([
      "source/img/*.{jpg,png,svg,webp}"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html",  gulp.series("htmlminify"));
  gulp.watch("source/img/*.{jpg,png,svg,webp}",  gulp.series("copy-image"));
  gulp.watch("source/js/*.js",  gulp.series("js"));
});

gulp.task('deploy', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

gulp.task("build", gulp.series("clean", "copy", "css", "htmlminify", "js"));
gulp.task("start", gulp.series("build", "server"));
