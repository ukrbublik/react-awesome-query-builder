var webpack = require('webpack');

module.exports = {
  devtool: 'inline-source-map',
  entry: './index',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['react-hot-loader', 'babel'], exclude: /node_modules/ }
    ]
  }
};
