var webpack = require('webpack');
var path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isProd = (process.env.NODE_ENV != "development");

var plugins = [];
if (isProd) {
    plugins = [
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|ru|es-us/),
        //new BundleAnalyzerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || "production"),
            }
        }),
    ];
} else {
    plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development"),
            }
        }),
    ];
}

module.exports = {
    plugins,
    mode: process.env.NODE_ENV || "development",
    devtool: isProd ? 'source-map' : 'source-map',
    devServer: {
        port: 3001,
        inline: true,
        historyApiFallback: true,
        hot: true,
    },
    entry: [
        //'react-hot-loader/patch', // seems like excess
        './index',
    ],
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, '../node_modules'),
        ],
        alias: {
            'react-awesome-query-builder': path.resolve(__dirname, '../modules'),
            'react-dom': '@hot-loader/react-dom',
            'antd': path.resolve(__dirname, 'node_modules/antd'),
            '@ant-design': path.resolve(__dirname, 'node_modules/@ant-design'),
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
                loaders: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env', 
                        '@babel/preset-react',
                        '@babel/preset-typescript', // or can use 'ts-loader' instead
                    ],
                    plugins: [
                        ["@babel/plugin-proposal-decorators", { "legacy": true }],
                        ["@babel/plugin-proposal-class-properties", { "loose": true }],
                        "@babel/plugin-transform-runtime", // or can use 'react-hot-loader/webpack' instead
                        "react-hot-loader/babel",
                        ["import", {
                            "libraryName": "antd",
                            "style": false,
                            "libraryDirectory": "es"
                        }],
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
