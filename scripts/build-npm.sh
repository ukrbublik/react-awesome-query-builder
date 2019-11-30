rm -rf build/npm
babel -d build/npm/lib ./modules
cp README.md build/npm
cp CONFIG.adoc build/npm
find build/npm/lib -type d -name __tests__ | xargs rm -rf
node -p 'p=require("./package");p.main="lib";p.scripts=p.devDependencies=undefined;JSON.stringify(p,null,2)' > build/npm/package.json

