const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const MODE = process.env.NODE_ENV || "development";
const PORT = 3001;
const isProd = (MODE != "development");
const isDev = (MODE == "development");
const isAnalyze = process.env.ANALYZE == "1";
const isSeparateCss = process.env.CSS == "1";
const EXAMPLES = __dirname;
const CORE_CSS = path.resolve(EXAMPLES, '../core/css/');
const CORE_MODULES = path.resolve(EXAMPLES, '../core/modules/');
const ANTD_MODULES = path.resolve(EXAMPLES, '../antd/modules/');
const MUI_MODULES = path.resolve(EXAMPLES, '../mui/modules/');
const MATERIAL_MODULES = path.resolve(EXAMPLES, '../material/modules/');
const BOOTSTRAP_MODULES = path.resolve(EXAMPLES, '../bootstrap/modules/');
const DIST = path.resolve(EXAMPLES, './build');

let plugins = [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(MODE),
        }
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
    }),
];

let aliases = {
    '@react-awesome-query-builder/core/css': CORE_CSS,
    '@react-awesome-query-builder/core': CORE_MODULES,
    '@react-awesome-query-builder/antd': ANTD_MODULES,
    '@react-awesome-query-builder/mui': MUI_MODULES,
    '@react-awesome-query-builder/material': MATERIAL_MODULES,
    '@react-awesome-query-builder/bootstrap': BOOTSTRAP_MODULES,
};
let style_loaders = [{
    loader: "style-loader"
}];

if (isProd) {
    plugins = [
        ...plugins,
        new CopyPlugin({
          patterns: [
            { from: "./index.html", to: DIST },
          ],
        }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru|es-us/),
        new MomentLocalesPlugin({
            localesToKeep: ['es-us', 'ru'],
        }),
    ];
}
if (isSeparateCss) {
    plugins = [
        ...plugins,
        new MiniCssExtractPlugin({
            filename: path.resolve(DIST, 'bundle.css')
        }),
    ];
    style_loaders = [
        MiniCssExtractPlugin.loader
    ];
}
if (isAnalyze) {
    plugins = [
        ...plugins,
        new BundleAnalyzerPlugin()
    ];
}

if (isDev) {
    plugins = [
        ...plugins,
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin()
    ];
}

const babel_options = {
    presets: [
        '@babel/preset-env', 
        '@babel/preset-react',
        '@babel/preset-typescript', // or can use 'ts-loader' instead
    ],
    plugins: [
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["@babel/plugin-proposal-private-methods", { "loose": true }],
        ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
        "@babel/plugin-transform-runtime",
        ...(isDev ? ["react-refresh/babel"] : []),
        ["import", {
            "libraryName": "antd",
            "style": false,
            "libraryDirectory": "es"
        }],
    ]
};

module.exports = {
    plugins,
    mode: MODE,
    devtool: isProd ? 'source-map' : 'source-map',
    devServer: {
        port: PORT,
        historyApiFallback: true,
        hot: true,
        // inline: true,
        static: {
          directory: path.join(__dirname, '/'),
        },
    },
    entry: './index',
    output: {
        path: DIST,
        filename: 'bundle.js'
    },
    resolve: {
        alias: aliases,
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.scss', '.less']
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        ...babel_options,
                        cacheDirectory: true
                    }
                }],
                resolve: {
                  fullySpecified: false,
                }
            },
            {
                test: /\.css$/,
                use: [...style_loaders, "css-loader"]
            },
            {
                test: /\.scss$/,
                use: [...style_loaders, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }]
            },
            {
                test: /\.less$/,
                use: [...style_loaders, {
                    loader: "css-loader"
                }, {
                    loader: "less-loader",
                    options: {
                        lessOptions: {
                            javascriptEnabled: true
                        }
                    }
                }]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader",
                options: {
                    limit: 10000,
                    minetype: 'application/font-woff'
                }
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            }

        ]
    }
};
