rm -rf lib

babel -d lib ./modules
cp modules/index.d.ts lib/index.d.ts

# re-export
pushd ../ui
  npm run build
popd
cp -R ../ui/lib/css ./lib/css
cp -R ../ui/css/* ./lib/css
