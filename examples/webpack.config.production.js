var webpack = require('webpack');
var path = require('path');

var webpack_config = require('./webpack.config');

webpack_config.plugins = [
    new webpack.NormalModuleReplacementPlugin(
        /^react-awesome-query-builder/, function (data) {
            const suffix = data.request.substring('react-awesome-query-builder'.length);
            data.request = path.resolve(__dirname, '../modules/' + suffix);
        }
    ),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }),
    new webpack.optimize.UglifyJsPlugin({
        output: {
            comments: false
        },
        compressor: {
            screw_ie8: true,
            warnings: false
        }
    })
]

module.exports = webpack_config;
