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
    // find .js and .d.ts
    .filter(e => e.isFile() && ['.js', '.ts'].includes(path.extname(e.name)))
    .map(e => e.name)
    .map(name => path.resolve(dir, name));
  const recFiles = dirs.map(findJsFilesInDirRec).reduce((arr, files) => [...arr, ...files], []);
  return [...jsFiles, ...recFiles];
};

const allJsFiles = findJsFilesInDirRec(CJS);
const fixesFiles = [];
allJsFiles.map(filePath => {
  const content = fs.readFileSync(filePath, {
    encoding: 'utf8'
  });
  const fixedContent = content.replace(/antd\/es\//sg, 'antd/lib/');
  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, {
      encoding: 'utf8'
    });
    fixesFiles.push(filePath);
  }
});

console.log(`Fixed antd/es/ -> antd/lib/ in ${fixesFiles.length} files in /cjs`);
if (fixesFiles.length > 0) {
  console.log('Fixed files:');
  fixesFiles.forEach(filePath => {
    const relativePath = path.relative(CJS, filePath);
    console.log(`- ${relativePath}`);
  });
}
