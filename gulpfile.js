const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');

const project = ts.createProject('tsconfig.json');

gulp.task('default', () =>
{
	del.sync(['./bin/**/*.*']);

	gulp.src('./src/**/*.ts')
		.pipe(project())
		.pipe(gulp.dest('bin/'));

	gulp.src('./src/**/*.js')
		.pipe(gulp.dest('bin/'));

	gulp.src('./src/**/*.json')
		.pipe(gulp.dest('bin/'));
});
