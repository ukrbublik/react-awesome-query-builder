const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
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
const CORE_MODULES = path.resolve(EXAMPLES, '../core/modules/');
const UI_MODULES = path.resolve(EXAMPLES, '../ui/modules/');
const ANTD_MODULES = path.resolve(EXAMPLES, '../antd/modules/');
const MUI_MODULES = path.resolve(EXAMPLES, '../mui/modules/');
const MATERIAL_MODULES = path.resolve(EXAMPLES, '../material/modules/');
const BOOTSTRAP_MODULES = path.resolve(EXAMPLES, '../bootstrap/modules/');
const UI_CSS = path.resolve(EXAMPLES, '../ui/styles/');
const ANTD_CSS = path.resolve(EXAMPLES, '../antd/styles/');
const MUI_CSS = path.resolve(EXAMPLES, '../mui/styles/');
const MATERIAL_CSS = path.resolve(EXAMPLES, '../material/styles/');
const BOOTSTRAP_CSS = path.resolve(EXAMPLES, '../bootstrap/styles/');
const DIST = path.resolve(EXAMPLES, './build');
const isMono = fs.existsSync(CORE_MODULES);

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

let aliases = isMono ? {
    '@react-awesome-query-builder/ui/css': UI_CSS,
    '@react-awesome-query-builder/antd/css': ANTD_CSS,
    '@react-awesome-query-builder/mui/css': MUI_CSS,
    '@react-awesome-query-builder/material/css': MATERIAL_CSS,
    '@react-awesome-query-builder/bootstrap/css': BOOTSTRAP_CSS,
    
    '@react-awesome-query-builder/core': CORE_MODULES,
    '@react-awesome-query-builder/ui': UI_MODULES,
    '@react-awesome-query-builder/antd': ANTD_MODULES,
    '@react-awesome-query-builder/mui': MUI_MODULES,
    '@react-awesome-query-builder/material': MATERIAL_MODULES,
    '@react-awesome-query-builder/bootstrap': BOOTSTRAP_MODULES,
} : {};

let style_loaders = [{
    loader: "style-loader"
}];
const lazy_style_loaders = [
    ({resource, descriptionData: {name} = {}}) => ({
    loader: "style-loader", 
    options: {
        injectType: (
            name && name.startsWith('@react-awesome-query-builder') || name === 'antd' || name === 'bootstrap' ?  
            "lazyStyleTag" : "styleTag"
        )
    }
})
];

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
        host: '0.0.0.0',
        allowedHosts: [
            'localhost',
            '.csb.app', // codesandbox.io
            '.webcontainer.io', // stackblitz.com
        ],
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
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.scss', '.less'],
        fallback: {
            buffer: false,
            process: false
        }
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
                  //fullySpecified: false,
                }
            },
            {
                test: /\.css$/,
                use: [...lazy_style_loaders, "css-loader"]
            },
            {
                test: /\.scss$/,
                use: [...lazy_style_loaders, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
            },
            {
                test: /\.less$/,
                use: [...lazy_style_loaders, {
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
