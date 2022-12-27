console.log(process.env)

const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const SCRIPTS = __dirname;
const ROOT = path.resolve(SCRIPTS, '../');
const PACKAGE_JSON = path.resolve(ROOT, './package.json');
const pjson = require(PACKAGE_JSON);
pjson['dependencies']['@react-awesome-query-builder/antd'] = pjson['version'];
pjson['dependencies']['@react-awesome-query-builder/mui'] = pjson['version'];
const pjsonStr = JSON.stringify(pjson, null, 2);
fs.writeFileSync(PACKAGE_JSON, pjsonStr);
