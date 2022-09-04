rm -f  ./package-lock.json
rm -f  ./yarn.json
rm -rf ./node_modules

rm -f  ./packages/core/package-lock.json
rm -f  ./packages/core/yarn.json
rm -rf ./packages/core/node_modules
rm -rf ./packages/core/ts_out
rm -rf ./packages/core/lib
rm -rf ./packages/core/build

rm -f  ./packages/tests/package-lock.json
rm -f  ./packages/tests/yarn.json
rm -rf ./packages/tests/node_modules
rm -rf ./packages/tests/ts_out
rm -rf ./packages/tests/coverage
rm -rf ./packages/tests/junit

rm -f  ./packages/examples/package-lock.json
rm -f  ./packages/examples/yarn.json
rm -rf ./packages/examples/node_modules
rm -rf ./packages/examples/build/*bundle*
rm -rf ./packages/examples/ts_out

rm -f  ./packages/sandbox/package-lock.json
rm -f  ./packages/sandbox/yarn.json
rm -rf ./packages/sandbox/node_modules
rm -rf ./packages/sandbox/dist
rm -rf ./packages/sandbox/ts_out
rm -rf ./packages/sandbox/build

rm -f  ./packages/sandbox_simple/package-lock.json
rm -f  ./packages/sandbox_simple/yarn.json
rm -rf ./packages/sandbox_simple/node_modules
rm -rf ./packages/sandbox_simple/build
