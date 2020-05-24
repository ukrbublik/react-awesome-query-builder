var webpack = require('webpack');
var path = require('path');

module.exports = {
    mode: "development",
    devtool: 'inline-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('test'),
          CI: JSON.stringify(process.env.CI),
        },
      }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        cacheDirectory: true,
                    },
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                }],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }]
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "less-loader",
                    options: {
                        javascriptEnabled: true
                    }
                }]
            }
        ],
    },
    node: {
      // Some tests import fs
      fs: 'empty',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        modules: [
            'node_modules',
            __dirname + '/node_modules',
        ],
        alias: {
            'ReactAwesomeQueryBuilder': __dirname + '/modules',
            'react-awesome-query-builder': __dirname + '/modules',
        }
    },
};
