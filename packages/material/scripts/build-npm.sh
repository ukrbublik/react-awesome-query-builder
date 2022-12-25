rm -rf ./lib # old name
rm -rf ./cjs
rm -rf ./esm
rm -rf ./css

babel -d ./cjs ./modules
ESM=1 babel -d ./esm ./modules
cp ./modules/index.d.ts ./cjs/index.d.ts
cp ./modules/index.d.ts ./esm/index.d.ts

# re-export
CWD=$(pwd)
cd ../ui
  npm run build
cd $CWD
cp -R ../ui/css ./css
cp -R ../ui/styles/* ./css
