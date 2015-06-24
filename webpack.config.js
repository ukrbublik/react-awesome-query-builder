var webpack = require('webpack');

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

if (process.env.COMPRESS) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compressor: {
        warnings: false
      }
    })
  );
}

module.exports = {
  output: {
    library: 'ReactQueryBuilder',
    libraryTarget: 'umd'
  },
  externals: [{
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    immutable: {
      root: 'Immutable',
      commonjs2: 'immutable',
      commonjs: 'immutable',
      amd: 'immutable'
    }
  }],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader?stage=0&optional=runtime']
      }
    ]
  },
  node: {
    Buffer: false
  },
  plugins: plugins
};
