const { rmSync } = require('fs');
const { resolve } = require('path');
const { execFileSync } = require('child_process');
const { initUtils, deleteFilesSync, copyFilesSync, waitFor } = require('../../core/scripts/utils.js');

const SCRIPTS = __dirname;
const PACKAGE = resolve(SCRIPTS, '../');
const CJS = resolve(PACKAGE, 'cjs');
const ESM = resolve(PACKAGE, 'esm');
const LIB = resolve(PACKAGE, 'lib'); // old name
const TYPES = resolve(PACKAGE, 'types');
const MODULES = resolve(PACKAGE, 'modules');
const CSS = resolve(PACKAGE, 'css');
const STYLES = resolve(PACKAGE, 'styles');
const BABEL = resolve(PACKAGE, 'node_modules', '.bin', 'babel');
const SASS = resolve(PACKAGE, 'node_modules', '.bin', 'sass');

async function main() {
  await initUtils();

  // clean
  [LIB, CJS, ESM, TYPES, CSS].map(fullPath => {
    rmSync(fullPath, { recursive: true, force: true })
  });

  // types
  execFileSync(
    'npm', ['run', 'tsc-emit-types'],
    { stdio: 'inherit', cwd: PACKAGE }
  );

  // cjs
  execFileSync(
    BABEL, ['--extensions', '.tsx,.jsx,.ts,.js', '-d', CJS, MODULES],
    { stdio: 'inherit', cwd: PACKAGE }
  );
  deleteFilesSync(CJS, `*.d.js`);

  // esm
  execFileSync(
    BABEL, ['--extensions', '.tsx,.jsx,.ts,.js', '-d', ESM, MODULES],
    { env: { ...process.env, ESM: '1' }, stdio: 'inherit', cwd: PACKAGE }
  );
  deleteFilesSync(ESM, `*.d.js`);

  // copy .d.ts files
  copyFilesSync(MODULES, TYPES, '*.d.ts');
  copyFilesSync(TYPES, CJS, '*.d.ts');
  copyFilesSync(TYPES, ESM, '*.d.ts');

  // build .css + copy .css and .scss files to /css
  execFileSync(
    SASS, [`${STYLES}/:${CSS}/`, '--no-source-map', '--style=expanded'],
    { stdio: 'inherit', cwd: PACKAGE }
  );
  copyFilesSync(STYLES, CSS, '*');
}

main();
