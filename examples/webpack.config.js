const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const PORT = 3001;
const lib_name = 'react-awesome-query-builder';
const isAnalyze = process.env.ANALYZE == "1";
const isProd = (process.env.NODE_ENV != "development");
const EXAMPLES = __dirname;
const RAQB_NODE_MODULES = path.resolve(EXAMPLES, '../node_modules/');
const MODULES = path.resolve(EXAMPLES, '../modules/');
// take antd from this node_modules
const ANTD = path.resolve(EXAMPLES, 'node_modules/antd/');
const ANTDESIGN = path.resolve(EXAMPLES, 'node_modules/@ant-design/');

let plugins = [
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development"),
        }
    }),
];
if (isProd) {
    plugins = [
        ...plugins,
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru|es-us/),
    ];
}
if (isAnalyze) {
    plugins = [
        ...plugins,
        new BundleAnalyzerPlugin()
    ];
}

module.exports = {
    plugins,
    mode: process.env.NODE_ENV || "development",
    devtool: isProd ? 'source-map' : 'source-map',
    devServer: {
        port: PORT,
        inline: true,
        historyApiFallback: true,
        hot: true,
    },
    entry: [
        //'react-hot-loader/patch', // seems like excess
        './index',
    ],
    output: {
        path: EXAMPLES,
        filename: 'bundle.js'
    },
    resolve: {
        modules: [
            // combine with parent node_modules
            'node_modules',
            RAQB_NODE_MODULES,
        ],
        alias: {
            [lib_name]: MODULES,
            'react-dom': '@hot-loader/react-dom',
            // take antd from this node_modules
            'antd': ANTD,
            '@ant-design': ANTDESIGN,
        },
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
                        presets: [
                            '@babel/preset-env', 
                            '@babel/preset-react',
                            '@babel/preset-typescript', // or can use 'ts-loader' instead
                        ],
                        plugins: [
                            ["@babel/plugin-proposal-decorators", { "legacy": true }],
                            ["@babel/plugin-proposal-class-properties", { "loose": true }],
                            ["@babel/plugin-proposal-private-methods", { "loose": true }],
                            "@babel/plugin-transform-runtime", // or can use 'react-hot-loader/webpack' instead
                            "react-hot-loader/babel",
                            ["import", {
                                "libraryName": "antd",
                                "style": false,
                                "libraryDirectory": "es"
                            }],
                        ]
                    },
                }]
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
