const gulp = require('gulp');
const gulp_ts = require('gulp-typescript');
const gulp_sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const path = require('path');
const { execSync } = require('child_process');

const project = gulp_ts.createProject('tsconfig.json');

let _linter;
let _gulp_tslint;
let _tslint;
let _runSequence;

const runSequence = () => _runSequence = _runSequence || require('run-sequence');
const gulp_tslint = () => _gulp_tslint = _gulp_tslint || require('gulp-tslint');
const tslint = () => _tslint = _tslint || require('tslint');
const linter = () => _linter = _linter || tslint().Linter.createProgram('tsconfig.json');

gulp.task('default', ['build']);
gulp.task('build:vscode', cb => runSequence()('lint', 'build', cb));
gulp.task('build:docs', () => execSync('npm run docs:indev'));
gulp.task('docs', cb => runSequence()('build', 'build:docs', cb));

gulp.task('pause', cb => setTimeout(() => cb(), 1e3));
gulp.task('tests', cb => runSequence()('lint', 'build', 'pause', 'build:tests', cb));
gulp.task('pkg', cb => runSequence()('build', 'pause', 'pause', 'package', cb));

gulp.task('lint', () => {
	gulp.src('src/**/*.ts')
		.pipe(gulp_tslint()({
			configuration: 'tslint.json',
			formatter: 'prose',
			program: linter()
		}))
		.pipe(gulp_tslint().report());
})

gulp.task('build', () => {
	del.sync(['bin/**/*.*']);
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(gulp_sourcemaps.init({ base: 'src' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('bin/'));

	gulp.src('src/**/*.js').pipe(gulp.dest('bin/'));
	gulp.src('src/**/*.json').pipe(gulp.dest('bin/'));
	gulp.src('src/**/*.lang').pipe(gulp.dest('bin/'));

	return tsCompile.js
		.pipe(gulp_sourcemaps.write('.', { sourceRoot: '../src' }))
		.pipe(gulp.dest('bin/'));
});

gulp.task('package', () => {
	del.sync(['../pkg/yamdbf/**/*.*'], { force: true });
	gulp.src('bin/**/*.*').pipe(gulp.dest('../pkg/yamdbf/bin'));
	gulp.src('src/**/*.*').pipe(gulp.dest('../pkg/yamdbf/src'));
	gulp.src('*.json').pipe(gulp.dest('../pkg/yamdbf'));
	gulp.src('gulpfile.js').pipe(gulp.dest('../pkg/yamdbf'));
	gulp.src('README.md').pipe(gulp.dest('../pkg/yamdbf'));
});

gulp.task('build:tests', () => {
	del.sync(['test/**/*.js']);
	const tsCompile = gulp.src('test/**/*.ts')
		.pipe(gulp_sourcemaps.init({ base: 'test' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('test/'));

	return tsCompile.js
		.pipe(gulp_sourcemaps.mapSources(sourcePath => path.join(__dirname, 'test', sourcePath)))
		.pipe(gulp_sourcemaps.write())
		.pipe(gulp.dest('test/'));
});

gulp.task('build:scripts', () => {
	del.sync(['scripts/**/*.js']);
	gulp.src('scripts/**/*.ts')
		.pipe(project())		
		.pipe(gulp.dest('scripts/'));
});
