const webpack = require('webpack');
const path = require('path');

const MODULES = path.resolve(__dirname, '../modules/');
const LibName = 'ReactAwesomeQueryBuilder';
const lib_name = 'react-awesome-query-builder';

module.exports = {
    mode: "development",
    // devtool: 'inline-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development'),
          CI: JSON.stringify(process.env.CI),
        },
      }),
    ],
    module: {
        rules: [
            // {
            //     test: /\.tsx?$/,
            //     use: [{
            //         loader: 'ts-loader'
            //     }],
            //     exclude: /node_modules/,
            // },
            {
                test: /\.[tj]sx?$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
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
                        lessOptions: {
                            javascriptEnabled: true
                        }
                    }
                }]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        modules: [
            'node_modules'
        ],
        alias: {
            [LibName]: MODULES,
            [lib_name]: MODULES,
        },
        fallback: {
          fs: false,
          util: false
        }
    },
};
