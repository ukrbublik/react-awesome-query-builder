rm -f  ./package-lock.json
rm -f  ./pnpm-lock.yaml
rm -f  ./packages/*/*.log
rm -rf ./node_modules

rm -f  ./packages/*/package-lock.json
rm -f  ./packages/*/*.log
rm -rf ./packages/*/node_modules
rm -rf ./packages/*/ts_out
rm -rf ./packages/*/lib
rm -rf ./packages/*/dist
rm -rf ./packages/*/build
rm -rf ./packages/*/coverage
rm -rf ./packages/*/junit

# npx sort-package-json "package.json" "packages/*/package.json"
