npm install -g json
json -I -f package.json \
  -e 'this.name="@ukrbublik/react-awesome-query-builder"' \
  -e 'this.repository.url="git://github.com/ukrbublik/react-awesome-query-builder.git"' \
  -e 'this.publishConfig={}' \
  -e 'this.publishConfig.registry="https://npm.pkg.github.com/"'
