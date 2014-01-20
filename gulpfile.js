var gulp = require('gulp')
	, jshint = require('gulp-jshint');

gulp.task('jshint', function () {
	gulp.src('./skeleton.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'));
});

gulp.task('default', function () {
	gulp.run('jshint');
});
