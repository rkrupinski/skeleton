var gulp = require('gulp')
  , jshint = require('gulp-jshint');

gulp.task('lint', function () {
  gulp
      .src([
        'index.js',
        './lib/**/*.js'
      ])
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter('jshint-stylish'));
});
