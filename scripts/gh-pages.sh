npm run build-examples
rm -rf /tmp/react-awesome-query-builder
mkdir /tmp/react-awesome-query-builder
mkdir /tmp/react-awesome-query-builder/gh-pages
cp ./examples/bundle.* /tmp/react-awesome-query-builder/gh-pages/
git checkout gh-pages
cp -R /tmp/react-awesome-query-builder/gh-pages/* .
git add ./bundle.*
git commit -m "update"
git checkout master

