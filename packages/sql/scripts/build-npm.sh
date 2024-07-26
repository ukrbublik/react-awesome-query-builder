rm -rf ./cjs
rm -rf ./esm
rm -rf ./types

# types
npm run tsc-emit-dts

# cjs
babel --extensions ".ts,.js" -d ./cjs ./modules
cp -r ./types/* ./cjs/

# esm with babel
ESM=1 babel --extensions ".ts,.js" -d ./esm ./modules
cp -r ./types/* ./esm/

# esm with tsc
# npm run tsc-emit-esm-composite

# todo - babel or tsc ?
