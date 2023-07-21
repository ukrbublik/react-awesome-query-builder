rm -rf ./lib # old name
rm -rf ./cjs
rm -rf ./esm
rm -rf ./css

babel --extensions ".tsx,.jsx,.js" -d ./cjs ./modules
#find ./cjs -name "*.js" -exec sed -i.bak "s+antd/es/+antd/lib/+g" {} +
#rm ./cjs/**/*.bak
node ./scripts/fix-antd.js
ESM=1 babel --extensions ".tsx,.jsx,.js" -d ./esm ./modules
cp ./modules/index.d.ts ./cjs/index.d.ts
cp ./modules/index.d.ts ./esm/index.d.ts

sass -I node_modules -I ../../node_modules styles/:css/ --no-source-map --style=expanded
cp ./styles/* ./css
