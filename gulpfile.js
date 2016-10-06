const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

// Build
gulp.task('build', (done) =>
{
	gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('bin'));
	gulp.src('src/**/*.json')
		.pipe(gulp.dest('bin'));
	done();
});

// Clean bin directory
gulp.task('clean', (done) =>
{
	del.sync(['bin/**', '!bin']);
	done();
});
