var webpack = require('webpack');
var path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru|es-us/),
    //new BundleAnalyzerPlugin(),
];

var optimization = {};

if (process.env.COMPRESS) {
    plugins = [
        ...plugins,
        new CompressionPlugin()
    ];
    optimization.minimizer = [new UglifyJsPlugin()];
}

module.exports = {
    plugins,
    optimization,
    mode: process.env.NODE_ENV || "development",
    output: {
        library: 'ReactAwesomeQueryBuilder',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'build/global'),
        filename: 'ReactAwesomeQueryBuilder' + (process.env.COMPRESS ? '.min' : '') + '.js',
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
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
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
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        modules: [
            'node_modules',
            __dirname,
            __dirname + '/node_modules',
        ],
        alias: {
            'ReactAwesomeQueryBuilder': __dirname + 'modules/',
            'immutable': 'immutable'
        }
    },
    node: {
        Buffer: false
    }
};
