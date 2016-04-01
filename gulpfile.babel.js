import gulp from 'gulp';
import ts from 'gulp-typescript';
import merge from 'merge2';
import typescript from 'typescript';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import del from 'del';

const tsProject = ts.createProject('tsconfig.json', { typescript });

gulp.task('clean', function(){
  return del(['./release']);
});

gulp.task('ts', ['clean'], function(){
  const result = gulp.src([
    './lib/**/*.ts',
    './manual-typings/**/*.d.ts',
    './typings/main.d.ts'
  ])
  .pipe(sourcemaps.init())
  .pipe(ts(tsProject));

  return merge([
    result.dts.pipe(gulp.dest('./release/definitions')),
    result.js.pipe(sourcemaps.write()).pipe(gulp.dest('./release/es6'))
  ]);
});

gulp.task('babel', ['ts'], function(){
  return gulp.src('./release/es6/**/*.js')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./release/cjs'));
});

gulp.task('build', ['babel'], function(){
  return gulp.src([
      './release/cjs/**/*.js',
      './release/definitions/**/*.d.ts',
      './package.json',
      './LICENSE'
    ])
    .pipe(gulp.dest('./release/npm'));
});
