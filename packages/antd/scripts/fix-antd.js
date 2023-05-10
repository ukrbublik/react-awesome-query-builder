const fs = require('fs');
const path = require('path');
const SCRIPTS = __dirname;
const PACKAGE = path.resolve(SCRIPTS, '../');
const CJS = path.resolve(PACKAGE, 'cjs');

const findJsFilesInDirRec = (dir) => {
  const ents = fs.readdirSync(dir, {
    withFileTypes: true,
  });
  const dirs = ents
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .map(name => path.resolve(dir, name));
  const jsFiles = ents
    .filter(e => e.isFile() && path.extname(e.name) === '.js')
    .map(e => e.name)
    .map(name => path.resolve(dir, name));
  const recFiles = dirs.map(findJsFilesInDirRec).reduce((arr, files) => [...arr, ...files], []);
  return [...jsFiles, ...recFiles];
};

const allJsFiles = findJsFilesInDirRec(CJS);
const fixedCnt = allJsFiles.map(filePath => {
  const content = fs.readFileSync(filePath, {
    encoding: 'utf8'
  });
  const fixedContent = content.replace(/antd\/es\//sg, 'antd/lib/');
  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, {
      encoding: 'utf8'
    });
    return 1;
  } else {
    return 0;
  }
}).reduce((cnt, r) => cnt + r, 0);
console.log(`Fixed antd/es/ -> antd/lib/ in ${fixedCnt} files in /cjs`);
