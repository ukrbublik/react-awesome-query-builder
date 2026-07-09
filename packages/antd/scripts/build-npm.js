const { rmSync, existsSync } = require('fs');
const { resolve } = require('path');
const { execFileSync } = require('child_process');
const { initUtils, deleteFilesSync, copyFilesSync, waitFor } = require('../../core/scripts/utils.js');

const SCRIPTS = __dirname;
const PACKAGE = resolve(SCRIPTS, '..');
const ROOT = resolve(PACKAGE, '../..');
const CJS = resolve(PACKAGE, 'cjs');
const ESM = resolve(PACKAGE, 'esm');
const LIB = resolve(PACKAGE, 'lib'); // old name
const TYPES = resolve(PACKAGE, 'types');
const MODULES = resolve(PACKAGE, 'modules');
const CSS = resolve(PACKAGE, 'css');
const STYLES = resolve(PACKAGE, 'styles');
const FIX_ANTD = resolve(SCRIPTS, 'fix-antd.js');
const BABEL = resolve(PACKAGE, 'node_modules', '.bin', 'babel');
const SASS = resolve(PACKAGE, 'node_modules', '.bin', 'sass');
const NODE_MODULES = resolve(PACKAGE, 'node_modules');
const ROOT_NODE_MODULES = resolve(ROOT, 'node_modules');
const UI_PACKAGE = resolve(PACKAGE, '..', 'ui');
const UI_STYLES = resolve(UI_PACKAGE, 'css', 'styles.scss');

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

  // fix cjs build (replace antd/es/ with antd/lib/)
  execFileSync(
    'node', [FIX_ANTD],
    { stdio: 'inherit', cwd: PACKAGE }
  );

  // build .css + copy .css and .scss files to /css
  await waitFor(() => existsSync(UI_STYLES));
  execFileSync(
    SASS, ['-I', NODE_MODULES, '-I', ROOT_NODE_MODULES, `${STYLES}/:${CSS}/`, '--no-source-map', '--style=expanded'],
    { stdio: 'inherit', cwd: PACKAGE }
  );
  copyFilesSync(STYLES, CSS, '*');
}

main();
