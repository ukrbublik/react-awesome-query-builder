rm -rf ./lib # old name
rm -rf ./cjs
rm -rf ./esm
rm -rf ./types
rm -rf ./css

# types
npm run tsc-emit-types

# cjs
babel --extensions ".tsx,.jsx,.ts,.js" -d ./cjs ./modules
find cjs/ -type f -name "*.d.js" | xargs -I{} rm {}

# esm with babel
ESM=1 babel --extensions ".tsx,.jsx,.ts,.js" -d ./esm ./modules
find esm/ -type f -name "*.d.js" | xargs -I{} rm {}

# copy .d.ts files from /types and /modules to /cjs, /esm, /types
mkdir -p types/config
find modules/ -type f -name "*.d.ts" | cut -d'/' -f2- | xargs -I{} cp modules/{} types/{}
find types/ -type f -name "*.d.ts" | cut -d'/' -f2- | xargs -I{} cp types/{} cjs/{}
find types/ -type f -name "*.d.ts" | cut -d'/' -f2- | xargs -I{} cp types/{} esm/{}
# rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./modules/ ./cjs/
# rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./modules/ ./esm/

# fix cjs build (replace antd/es/ with antd/lib/)
#find ./cjs -name "*.js" -exec sed -i.bak "s+antd/es/+antd/lib/+g" {} +
#rm ./cjs/**/*.bak
node ./scripts/fix-antd.js

# build .css + copy .css and .scss files to /css
sass -I node_modules -I ../../node_modules styles/:css/ --no-source-map --style=expanded
cp ./styles/* ./css
