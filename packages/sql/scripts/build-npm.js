const { rmSync } = require('fs');
const { resolve } = require('path');
const { execFileSync } = require('child_process');
const { initUtils, deleteFilesSync, copyFilesSync } = require('../../core/scripts/utils.js');

const SCRIPTS = __dirname;
const PACKAGE = resolve(SCRIPTS, '..');
const CJS = resolve(PACKAGE, 'cjs');
const ESM = resolve(PACKAGE, 'esm');
const TYPES = resolve(PACKAGE, 'types');
const MODULES = resolve(PACKAGE, 'modules');
const BABEL = resolve(PACKAGE, 'node_modules', '.bin', 'babel');

async function main() {
  await initUtils();
  
  // clean
  [CJS, ESM, TYPES].map(fullPath => {
    rmSync(fullPath, { recursive: true, force: true })
  });

  // types
  execFileSync(
    'npm', ['run', 'tsc-emit-types'],
    { stdio: 'inherit', cwd: PACKAGE }
  );

  // cjs
  execFileSync(
    BABEL, ['--extensions', '.ts,.js', '-d', CJS, MODULES],
    { stdio: 'inherit', cwd: PACKAGE }
  );
  deleteFilesSync(CJS, `*.d.js`);

  // esm
  execFileSync(
    BABEL, ['--extensions', '.ts,.js', '-d', ESM, MODULES],
    { env: { ...process.env, ESM: '1' }, stdio: 'inherit', cwd: PACKAGE }
  );
  deleteFilesSync(ESM, `*.d.js`);

  // copy .d.ts files
  copyFilesSync(TYPES, CJS, '*.d.ts');
  copyFilesSync(TYPES, ESM, '*.d.ts');
}

main();
