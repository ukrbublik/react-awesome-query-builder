'use strict';

var webpack = require('webpack');

var webpack_config = require('./webpack.config');

module.exports = function (config) {
    config.set({
        browsers: [ 'Chrome' ], //run in Chrome
        singleRun: false, //just run once by default
        autoWatch: true,
        frameworks: [ 'mocha' ], //use the mocha test framework
        files: [
            'tests/webpack.js' //just load this file
        ],
        preprocessors: {
            'tests/webpack.js': [ 'webpack', 'sourcemap' ] //preprocess with webpack and our sourcemap loader
        },
        reporters: [ 'dots' ], //report results in this format
        webpack: webpack_config,
        webpackServer: {
            noInfo: true //please don't spam the console when running in karma!
        }
    });
};