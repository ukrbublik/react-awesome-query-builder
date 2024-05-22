const path = require('path');

const NODE_MODULES = path.resolve(__dirname, './node_modules/');

const babel_options = {
  presets: [
    '@babel/preset-env', 
    '@babel/preset-react',
    '@babel/preset-typescript',
  ]
};

module.exports = {
  experimental: { esmExternals: "loose", },
  webpack: (config) => {
    ['.scss', '.tsx', '.jsx', '.ts', '.js'].map(ext => {
      if (!config.resolve.extensions.includes(ext)) {
        config.resolve.extensions.push(ext);
      }
    });
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ['react']: path.resolve(NODE_MODULES, 'react'),
      ['react-dom']: path.resolve(NODE_MODULES, 'react-dom'),
    };
    config.module.rules.push(
      {
        test: /\.[jt]sx?$/, 
        exclude: /(node_modules)/,
        use: [{
          loader: 'babel-loader',
          options: {
            ...babel_options,
            cacheDirectory: true
          }
        }],
      }
    );
    return config;
  }
};
