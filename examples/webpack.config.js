const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const MODE = process.env.NODE_ENV || "development";
const PORT = 3001;
const lib_name = 'react-awesome-query-builder';
const isProd = (MODE != "development");
const isDev = (MODE == "development");
const isAnalyze = process.env.ANALYZE == "1";
const isSeparateCss = process.env.CSS == "1";
const EXAMPLES = __dirname;
const RAQB_NODE_MODULES = path.resolve(EXAMPLES, '../node_modules/');
const MODULES = path.resolve(EXAMPLES, '../modules/');
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
    [lib_name]: MODULES
};
let style_loaders = [{
    loader: "style-loader"
}];

if (isProd) {
    plugins = [
        ...plugins,
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
    aliases = {
        ...aliases,
        'react-dom': '@hot-loader/react-dom',
    };
}

const babel_options = {
    presets: [
        '@babel/preset-env', 
        '@babel/preset-react',
        '@babel/preset-typescript', // or can use 'ts-loader' instead
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
        ["@babel/plugin-proposal-private-methods", { "loose": true }],
        ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
        "@babel/plugin-transform-runtime", // or can use 'react-hot-loader/webpack' instead
        "react-hot-loader/babel",
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
        modules: [
            // combine with parent node_modules
            'node_modules',
            RAQB_NODE_MODULES,
        ],
        alias: aliases,
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    module: {
        rules: [
            // {
            //     test: /\.tsx?$/,
            //     loader: 'ts-loader',
            //     exclude: /node_modules/,
            // },
            // {
            //     test: /\.jsx?$/,
            //     use: 'react-hot-loader/webpack',
            //     exclude: /node_modules/
            // },
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        ...babel_options,
                        cacheDirectory: true
                    }
                }]
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
