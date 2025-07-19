const { rmSync, mkdirSync, copyFileSync, existsSync } = require('fs');
const { resolve, dirname } = require('path');
const { execFileSync } = require('child_process');
let globbySync; // to be imported dynamically using ESM syntax

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

const deleteFilesSync = (from, pattern, { verbose } = {}) => {
  const fromRelPath = from.substring(PACKAGE.length + 1);
  const removedFiles = globbySync([`${from}/**/${pattern}`])
    .map(fullPath => {
      const relativePath = fullPath.substring(from.length + 1);
      rmSync(fullPath);
      if (verbose) {
        console.log(`Deleted ${relativePath} from ${fromRelPath}`);
      }
      return relativePath;
    });
  console.log(`Removed ${removedFiles.length} ${pattern} files in ${fromRelPath}`);
};

const copyFilesSync = (from, to, pattern, { verbose } = {}) => {
  const fromRelPath = from.substring(PACKAGE.length + 1);
  const toRelPath = to.substring(PACKAGE.length + 1);
  const copiedFiles = globbySync([`${from}/**/${pattern}`])
    .map(fullPath => {
      const fromFullPath = fullPath;
      const relativePath = fullPath.substring(from.length + 1);
      const toFullPath = `${to}/${relativePath}`;
      const toDir = dirname(toFullPath);
      return {
        fromFullPath,
        toFullPath,
        toDir,
        relativePath,
      };
    })
    .map(({ fromFullPath, toDir, toFullPath, relativePath }) => {
      mkdirSync(toDir, { recursive: true });
      copyFileSync(fromFullPath, toFullPath);
      if (verbose) {
        console.log(`Copied ${relativePath} from ${fromRelPath} to ${toRelPath}`);
      }
      return relativePath;
    });
  console.log(`Copied ${copiedFiles.length} ${pattern} files from ${fromRelPath} to ${toRelPath}`);
};

const waitFor = async (cond) => {
  const maxTries = 120;
  const retryInterval = 1000; // ms
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let tryNo = 0;
  let res;
  while (!res && tryNo < maxTries) {
    tryNo++;
    res = await cond();
    if (!res) {
      await wait(retryInterval);
    }
  }
  return res;
};

async function main() {
  ({ globbySync } = await import('globby'));

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
