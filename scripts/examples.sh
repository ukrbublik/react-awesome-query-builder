cd examples
rm -rf node_modules
webpack-dev-server --config webpack.config.js -d --hot --inline --display-error-details --colors --history-api-fallback --no-info --port 3001

