const gulp = require('gulp');
const webpack = require('webpack');

gulp.task('dev', () => {
	webpack(require('./webpack.config.js'));
});
