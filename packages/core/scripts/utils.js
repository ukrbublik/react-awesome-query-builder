const { rmSync, mkdirSync, copyFileSync } = require('fs');
const { resolve, dirname } = require('path');

let globbySync; // to be imported dynamically using ESM syntax

const SCRIPTS = __dirname;
const PACKAGE = resolve(SCRIPTS, '../');
const ROOT = resolve(PACKAGE, '../..');

const deleteFilesSync = (from, pattern, { verbose } = {}) => {
  const fromRelPath = from.substring(ROOT.length + 1);
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
  const fromRelPath = from.substring(ROOT.length + 1);
  const toRelPath = to.substring(ROOT.length + 1);
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

async function initUtils() {
  ({ globbySync } = await import('globby'));
}

module.exports = {
  initUtils,
  deleteFilesSync,
  copyFilesSync,
  waitFor,
};
