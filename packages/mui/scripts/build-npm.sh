rm -rf ./lib # old name
rm -rf ./cjs
rm -rf ./esm

babel -d ./cjs ./modules
ESM=1 babel -d ./esm ./modules

rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./modules/ ./cjs/
rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./modules/ ./esm/

rm -rf ./css
sass -I node_modules -I ../../node_modules styles/:css/ --no-source-map --style=expanded
cp -r ./styles/* ./css/

