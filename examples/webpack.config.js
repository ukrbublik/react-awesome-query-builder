var webpack = require('webpack');
var path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var plugins = [];
if (process.env.NODE_ENV != "development") {
    plugins = [
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru|es-us/),
        //new BundleAnalyzerPlugin(),
    ];
}

module.exports = {
    plugins,
    mode: process.env.NODE_ENV || "development",
    devtool: 'source-map',
    entry: './index',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            'react-awesome-query-builder': path.resolve(__dirname, '../modules'),
        },
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                loaders: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react'],
                  plugins: [
                    [ "@babel/plugin-proposal-decorators", { "legacy": true } ],
                    [ "@babel/plugin-proposal-class-properties", {
                      "loose": true
                    }],
                    "@babel/plugin-transform-runtime",
                    ["import", {
                        "libraryName": "antd",
                        "style": false,
                        "libraryDirectory": "es"
                    }]
                  ]
                },
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
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&minetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            }

        ]
    }
};
