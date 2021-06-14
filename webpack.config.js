const webpack = require('webpack');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');

const MODE = process.env.NODE_ENV || "development";
const BUILD = path.resolve(__dirname, 'build/');
const MODULES = path.resolve(__dirname, 'modules/');
const isCompress = process.env.COMPRESS == "1";
const LibName = 'ReactAwesomeQueryBuilder';
const lib_name = 'react-awesome-query-builder';

let plugins = [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(MODE),
        }
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru|es-us/),
];
let optimization = {};

if (isCompress) {
    plugins = [
        ...plugins,
        new CompressionPlugin()
    ];
    optimization.minimize = true;
}

module.exports = {
    plugins,
    optimization,
    mode: MODE,
    entry: [
        './modules/index.js',
    ],
    output: {
        library: LibName,
        libraryTarget: 'umd',
        path: BUILD,
        filename: LibName + (isCompress ? '.min' : '') + '.js',
    },
    externals: [
        {
            "react": "React",
            "react-dom": "ReactDOM",
            "react-redux": "ReactRedux",
            "redux": "Redux",
            "immutable": "Immutable",
            "moment": 'moment',
            // "sqlstring": "sqlstring",
            // "classnames": "classnames",
        },
        /^lodash\/.+$/,
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.[jt]sx?$/,
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
            [lib_name]: MODULES
        },
        fallback: {
            Buffer: false,
        }
    }
};
