rm -rf ./lib # old name
rm -rf ./cjs
rm -rf ./esm

babel --extensions ".tsx,.jsx,.ts,.js" -d ./cjs ./modules
find cjs/ -type f -name "*.d.js" | xargs -I{} rm {}
#find ./cjs -name "*.js" -exec sed -i.bak "s+antd/es/+antd/lib/+g" {} +
#rm ./cjs/**/*.bak
node ./scripts/fix-antd.js

ESM=1 babel --extensions ".tsx,.jsx,.ts,.js" -d ./esm ./modules
find esm/ -type f -name "*.d.js" | xargs -I{} rm {}

# rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./modules/ ./cjs/
# rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./modules/ ./esm/
find modules/ -type f -name "*.d.ts" | cut -d'/' -f2- | xargs -I{} cp modules/{} cjs/{}
find modules/ -type f -name "*.d.ts" | cut -d'/' -f2- | xargs -I{} cp modules/{} esm/{}

rm -rf ./css
sass -I node_modules -I ../../node_modules styles/:css/ --no-source-map --style=expanded
cp ./styles/* ./css
