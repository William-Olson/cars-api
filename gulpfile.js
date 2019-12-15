const gulp = require("gulp");
const ts = require("gulp-typescript");
const nodemon = require("gulp-nodemon");
const debug = require('debug')('gulpScript');
const tslint = require('tslint');
const gulpTslint = require('gulp-tslint');

const srcFilesPath = './src/**/*.ts';

/*

  Linter task

  Checks the code for common mistakes etc.
  Uses the tslint.json file for specifying linting options.

*/
const lintingTask = () => {
  const program = tslint.Linter.createProgram('./tsconfig.json');
  return gulp.src(srcFilesPath, { base: '.' })
    .pipe(gulpTslint({ formatter: 'stylish', program }))
    .pipe(gulpTslint.report());
};

/*

  Typescript transpiler task

  Converts the Typescript code to JavaScript.
  Uses the tsconfig.json file for defining options.

*/
const transpileTask = () => {
  const tsProject = ts.createProject('tsconfig.json');
  const out = gulp.src(srcFilesPath).pipe(tsProject());
  return out.js.pipe(gulp.dest('build'));
};

/*

  Nodemon task

  Starts the app from the output directory and
  watches src files for changes. Starts the build
  and reruns the app when file changes happen.

*/
const nodemonTask = () => {

  const stream = nodemon({
    script: 'build/app.js',
    ext: 'ts js json',
    watch: [ 'src' ],
    tasks: ['build'],
    env: {
      DEBUG: process.env.DEBUG || 'app',
      SERVICES: process.env.SERVICES,
    }
  });

  stream.on('restart', () =>
    debug('Application restarted!')
  );

  stream.on('crash', () => {
    debug('Application has crashed!\n');
    stream.emit('restart', 3); // restart after 3s
  });

  return stream;

};

// task linking
gulp.task('lint', lintingTask);
gulp.task('transpile', transpileTask);
gulp.task('nodemon', nodemonTask);

// available tasks
gulp.task('build', gulp.series('lint', 'transpile'));
gulp.task('dev', gulp.series('build', 'nodemon'));
gulp.task('default', gulp.series('build'));
