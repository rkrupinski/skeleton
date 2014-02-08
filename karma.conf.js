module.exports = function(config) {
	config.set({
		frameworks: [
			'jasmine'
		],
		browsers: [
			'PhantomJS'
		],
		reporters: [
			'dots'
		],
		singleRun: true
	});
};