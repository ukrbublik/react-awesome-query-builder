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
];
var optimization = {};

if (process.env.ANALYZE == "1") {
    plugins = [
        ...plugins,
        new BundleAnalyzerPlugin()
    ];
}

if (process.env.COMPRESS == "1") {
    plugins = [
        ...plugins,
        new CompressionPlugin()
    ];
    optimization.minimizer = [new UglifyJsPlugin()];
}

module.exports = {
    plugins,
    optimization,
    mode:  process.env.NODE_ENV || "development",
    output: {
        library: 'ReactAwesomeQueryBuilder',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'build'),
        filename: 'ReactAwesomeQueryBuilder' + (process.env.COMPRESS ? '.min' : '') + '.js',
    },
    externals: [
        {
            "react": "React",
            "react-dom": "ReactDOM",
            "react-redux": "ReactRedux",
            "redux": "Redux",
            "immutable": "Immutable",
            "moment": 'moment',
            "transit-js": "Transit",
            "transit-immutable-js": "TransitImmutable",
            "sqlstring": "sqlstring",
            "classnames": "classnames",
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
            __dirname + '/node_modules',
        ],
        alias: {
            'ReactAwesomeQueryBuilder': __dirname + '/modules/',
            'immutable': 'immutable'
        }
    },
    node: {
        Buffer: false
    }
};
