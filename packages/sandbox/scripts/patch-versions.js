if (process.env['HOME'].indexOf('/sandbox') !== -1) {
  const fs = require('fs');
  const path = require('path');
  const { exit } = require('process');
  const SCRIPTS = __dirname;
  const ROOT = path.resolve(SCRIPTS, '../');
  const PACKAGE_JSON = path.resolve(ROOT, './package.json');
  const pjson = require(PACKAGE_JSON);
  for (const k in pjson['dependencies']) {
  if (k.indexOf('@react-awesome-query-builder/') === 0) {
      pjson['dependencies'][k] = pjson['version'];
  }
  }
  const pjsonStr = JSON.stringify(pjson, null, 2);
  fs.writeFileSync(PACKAGE_JSON, pjsonStr);
}
