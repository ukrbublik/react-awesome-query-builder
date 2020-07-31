npm install -g json
json -I -f package.json \
  -e 'this.name="react-awesome-query-builder"' \
  -e 'this.repository.url="https://github.com/ukrbublik/react-awesome-query-builder.git"' \
  -e 'delete this.publishConfig'
