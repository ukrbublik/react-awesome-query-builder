const { rmSync, mkdirSync, copyFileSync } = require('fs');
const { resolve, dirname } = require('path');
const { execSync } = require('child_process');
let globbySync; // to be imported dynamically using ESM syntax

const SCRIPTS = __dirname;
const PACKAGE = resolve(SCRIPTS, '..');
const CJS = resolve(PACKAGE, 'cjs');
const ESM = resolve(PACKAGE, 'esm');
const TYPES = resolve(PACKAGE, 'types');
const MODULES = resolve(PACKAGE, 'modules');
const BABEL = resolve(PACKAGE, 'node_modules', '.bin', 'babel');

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
  [CJS, ESM, TYPES].map(fullPath => {
    rmSync(fullPath, { recursive: true, force: true })
  });

  // types
  execSync("npm run tsc-emit-types", { stdio: 'inherit' });

  // cjs
  execSync(`${BABEL} --extensions ".ts,.js" -d ${CJS} ${MODULES}`, { stdio: 'inherit' });
  deleteFilesSync(CJS, `*.d.js`);

  // esm
  execSync(`ESM=1 ${BABEL} --extensions ".ts,.js" -d ${ESM} ${MODULES}`, { stdio: 'inherit' });
  deleteFilesSync(ESM, `*.d.js`);

  // copy .d.ts files
  copyFilesSync(TYPES, CJS, '*.d.ts');
  copyFilesSync(TYPES, ESM, '*.d.ts');
}

main();
