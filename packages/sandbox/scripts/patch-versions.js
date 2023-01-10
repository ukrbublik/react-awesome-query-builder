const fs = require('fs');
const path = require('path');
const SCRIPTS = __dirname;
const PACKAGE = path.resolve(SCRIPTS, '../');
const PACKAGES = path.resolve(PACKAGE, '../');
const isInWorkspace = path.basename(PACKAGES) === 'packages';
const isInSandbox = process.env['HOME'].indexOf('/sandbox') !== -1;

if (isInSandbox || !isInWorkspace) {
  const PACKAGE_JSON = path.resolve(PACKAGE, './package.json');
  const pjson = require(PACKAGE_JSON);
  for (const k in pjson['dependencies']) {
    if (k.indexOf('@react-awesome-query-builder/') === 0) {
      pjson['dependencies'][k] = pjson['version'];
    }
  }
  const pjsonStr = JSON.stringify(pjson, null, 2);
  fs.writeFileSync(PACKAGE_JSON, pjsonStr);
}
