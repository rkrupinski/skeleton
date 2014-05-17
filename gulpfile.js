var gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , rename = require("gulp-rename");

gulp.task('jshint', function () {
  gulp.src('skeleton.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('uglify', function() {
  gulp.src('skeleton.js')
    .pipe(uglify())
    .pipe(rename('skeleton.min.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', [
  'jshint',
  'uglify'
]);
