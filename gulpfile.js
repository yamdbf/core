const gulp = require('gulp');
const babel = require('gulp-babel');
const exec = require('gulp-exec');
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

gulp.task('package', (done) =>
{
	gulp.src('src/**/*js')
		.pipe(babel())
		.pipe(gulp.dest('pkg/yamdbf/bin'));
	gulp.src('src/**/*.json')
		.pipe(gulp.dest('pkg/yamdbf/bin'));
	gulp.src('typings/index.d.ts')
		.pipe(gulp.dest('pkg/yamdbf/typings'));
	gulp.src(['package.json', '*.md', 'examples/config.json.example'])
		.pipe(gulp.dest('pkg/yamdbf'));
	done();
});

// Clean bin directory
gulp.task('clean', (done) =>
{
	del.sync(['bin/**', '!bin']);
	done();
});

// Clean package directory
gulp.task('clean-package', (done) =>
{
	del.sync(['pkg/yamdbf/bin/**', '!pkg/yamdbf/bin']);
	done();
});

// Commit & tag version
gulp.task('tag-release', () =>
{
	const version = require('./package.json').version;
	return gulp.src('.')
		.pipe(exec(`git commit -am "Prepare ${version} release"`))
		.pipe(exec(`git tag v${version}`))
		.pipe(exec(`git push origin : v${version}`));
});
