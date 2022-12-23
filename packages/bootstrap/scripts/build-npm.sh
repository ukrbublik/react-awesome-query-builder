rm -rf lib

babel -d lib ./modules
cp modules/index.d.ts lib/index.d.ts

# re-export
CWD=$(pwd)
cd ../ui
npm run build
cd $CWD
cp -R ../ui/lib/css ./lib/css
cp -R ../ui/css/* ./lib/css
