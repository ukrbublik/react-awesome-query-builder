rm -rf lib

babel -d lib ./modules
cp modules/index.d.ts lib/index.d.ts

# re-export
npm run build --prefix ../ui
cp -R ../ui/lib/css ./lib/css
cp -R ../ui/css/* ./lib/css
