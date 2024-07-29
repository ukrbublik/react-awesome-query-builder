rm -rf ./cjs
rm -rf ./esm
rm -rf ./types

# types
npm run tsc-emit-types

# cjs
babel --extensions ".ts,.js" -d ./cjs ./modules
rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./types/ ./cjs/

# esm with babel
ESM=1 babel --extensions ".ts,.js" -d ./esm ./modules
rsync -ma --include '*/' --include '*.d.ts' --exclude '*' ./types/ ./esm/

# esm with tsc -- don't use, it's not es6 compatible
#npm run tsc-emit-esm-with-dts
