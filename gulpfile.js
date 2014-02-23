var gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , uglify = require('gulp-uglify')
  , rename = require("gulp-rename")
  , karma = require('gulp-karma');

gulp.task('jshint', function () {
  gulp.src('skeleton.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
  gulp.src('skeleton.js')
    .pipe(uglify())
    .pipe(rename('skeleton.min.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('karma', function () {
  gulp.src([
    'skeleton.js',
    'test/{,*/}*.js'
  ])
    .pipe(karma({
      action: 'run',
      configFile: 'karma.conf.js'
    }));
});

gulp.task('default', [
  'jshint',
  'karma',
  'uglify'
]);
