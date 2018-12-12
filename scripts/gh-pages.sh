npm run build-global
npm run build-examples
rm -rf /tmp/react-awesome-query-builder
mkdir /tmp/react-awesome-query-builder
mkdir /tmp/react-awesome-query-builder/gh-pages
cp ./examples/bundle.js ./examples/bundle.js.map /tmp/react-awesome-query-builder/gh-pages
git checkout gh-pages
cp /tmp/react-awesome-query-builder/gh-pages/* . -R
git add ./bundle.js
git add ./bundle.js.map
git commit -m "update"
git checkout master

