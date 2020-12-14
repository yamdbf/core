/* eslint-disable @typescript-eslint/typedef, no-return-assign, @typescript-eslint/explicit-function-return-type */
const gulp = require('gulp');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const del = require('del');
const path = require('path');
const { execSync } = require('child_process');

const project = typescript.createProject('tsconfig.json');

let _runSequence;

const runSequence = () => _runSequence = _runSequence || require('run-sequence');

gulp.task('build:docs', () => execSync('npm run docs:indev'));
gulp.task('docs', cb => runSequence()('build', 'build:docs', cb));
gulp.task('gh-prebuild', cb => runSequence()('build', 'gh-prebuild-prepare', cb));

gulp.task('pause', cb => setTimeout(() => cb(), 1e3));

gulp.task('lint', () =>
	gulp.src('src/**/*.ts')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError()));

gulp.task('build', () =>
{
	del.sync(['bin/**/*.*']);
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(sourcemaps.init({ base: 'src' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('bin/'));

	gulp.src('src/**/*.js').pipe(gulp.dest('bin/'));
	gulp.src('src/**/*.json').pipe(gulp.dest('bin/'));
	gulp.src('src/**/*.lang').pipe(gulp.dest('bin/'));

	return tsCompile.js
		.pipe(sourcemaps.write('.', { sourceRoot: '../src' }))
		.pipe(gulp.dest('bin/'));
});

gulp.task('gh-prebuild-prepare', () =>
{
	del.sync([
		'../yamdbf-prebuilt/**',
		'../yamdbf-prebuilt/.*',
		'!../yamdbf-prebuilt',
		'!../yamdbf-prebuilt/.git',
		'!../yamdbf-prebuilt/.git/**'
	], { force: true });
	gulp.src('bin/**/*.*').pipe(gulp.dest('../yamdbf-prebuilt/bin'));
	gulp.src('package.json').pipe(gulp.dest('../yamdbf-prebuilt'));
});

gulp.task('build:tests', () =>
{
	del.sync(['test/**/*.js']);
	const tsCompile = gulp.src('test/**/*.ts')
		.pipe(sourcemaps.init({ base: 'test' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('test/'));

	return tsCompile.js
		.pipe(sourcemaps.mapSources(sourcePath => path.join(__dirname, 'test', sourcePath)))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('test/'));
});

gulp.task('build:scripts', () =>
{
	del.sync(['scripts/**/*.js']);
	del.sync(['scripts/**/*.js.map']);
	del.sync(['scripts/**/*.d.ts']);
	const tsCompile = gulp.src('scripts/**/*.ts')
		.pipe(sourcemaps.init({ base: 'scripts' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('scripts/'));

	return tsCompile.js
		.pipe(sourcemaps.write('.', { sourceRoot: '../scripts' }))
		.pipe(gulp.dest('scripts/'));
});

gulp.task('default', gulp.series('build'));
gulp.task('build:vscode', gulp.series('lint', 'build'));
gulp.task('tests', gulp.series('lint', 'build', 'pause', 'build:tests'));
