rm -rf lib

babel -d lib ./modules
cp modules/index.d.ts lib/index.d.ts

# re-export
cp -R ../ui/lib/css ./lib/css
cp -R ../ui/css/* ./lib/css
