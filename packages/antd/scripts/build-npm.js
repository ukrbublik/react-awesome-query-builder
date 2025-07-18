const { rmSync, mkdirSync, copyFileSync } = require('fs');
const { resolve, dirname } = require('path');
const { execSync } = require('child_process');
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
const BABEL = resolve(PACKAGE, 'node_modules', '.bin', 'babel');
const SASS = resolve(PACKAGE, 'node_modules', '.bin', 'sass');
const NODE_MODULES = resolve(PACKAGE, 'node_modules');
const ROOT_NODE_MODULES = resolve(ROOT, 'node_modules');

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

async function main() {
  ({ globbySync } = await import('globby'));

  // clean
  [LIB, CJS, ESM, TYPES, CSS].map(fullPath => {
    rmSync(fullPath, { recursive: true, force: true })
  });

  // types
  execSync("npm run tsc-emit-types", { stdio: 'inherit' });

  // cjs
  execSync(`${BABEL} --extensions ".tsx,.jsx,.ts,.js" -d ${CJS} ${MODULES}`, { stdio: 'inherit' });
  deleteFilesSync(CJS, `*.d.js`);

  // esm
  execSync(`ESM=1 ${BABEL} --extensions ".tsx,.jsx,.ts,.js" -d ${ESM} ${MODULES}`, { stdio: 'inherit' });
  deleteFilesSync(ESM, `*.d.js`);

  // copy .d.ts files
  copyFilesSync(MODULES, TYPES, '*.d.ts');
  copyFilesSync(TYPES, CJS, '*.d.ts');
  copyFilesSync(TYPES, ESM, '*.d.ts');

  // fix cjs build (replace antd/es/ with antd/lib/)
  execSync(`node ${SCRIPTS}/fix-antd.js`, { stdio: 'inherit' });

  // build .css + copy .css and .scss files to /css
  execSync(`${SASS} -I ${NODE_MODULES} -I ${ROOT_NODE_MODULES} ${STYLES}/:${CSS}/ --no-source-map --style=expanded`, { stdio: 'inherit' });
  copyFilesSync(STYLES, CSS, '*');
}

main();
