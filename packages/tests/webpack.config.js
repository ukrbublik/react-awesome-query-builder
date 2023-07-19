const webpack = require('webpack');
const path = require('path');

const CORE = path.resolve(__dirname, "../core/modules");
const UI = path.resolve(__dirname, "../ui/modules");
const ANTD = path.resolve(__dirname, "../antd/modules");
const MUI = path.resolve(__dirname, "../mui/modules");
const MATERIAL = path.resolve(__dirname, "../material/modules");
const BOOTSTRAP = path.resolve(__dirname, "../bootstrap/modules");
const FLUENT = path.resolve(__dirname, "../fluent/modules");
const TESTS = path.resolve(__dirname);

const isDebug = !!process.env.TEST_DEBUG;

module.exports = {
    mode: "development",
    // source-map is needed for adequate coverage data
    // inline-source-map is needed for debugging tests
    devtool: isDebug ? 'inline-source-map' : 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development'),
          CI: JSON.stringify(process.env.CI),
        },
      }),
    ],
    module: {
        rules: [
            {
                test: /\.[tj]sx?$/,
                include: [ TESTS ],
                use: [ 
                    {
                        loader: 'babel-loader',
                        options: {
                          configFile: path.resolve(__dirname, ".babelrc"),
                          cacheDirectory: true
                        },
                    },
                ],
                exclude: /node_modules/,
                resolve: {
                  //fullySpecified: false,
                }
            },
            {
                test: /\.[tj]sx?$/,
                include: [
                    CORE,
                    UI,
                    ANTD,
                    MUI,
                    MATERIAL,
                    BOOTSTRAP,
                    FLUENT
                ],
                use: [ 
                    {
                        loader: '@jsdevtools/coverage-istanbul-loader',
                        options: {
                          compact: false
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                          configFile: path.resolve(__dirname, ".babelrc"),
                          cacheDirectory: true
                        },
                    },
                ],
                exclude: /node_modules/,
                resolve: {
                  //fullySpecified: false,
                }
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
        alias: {
            '@react-awesome-query-builder/core': CORE,
            '@react-awesome-query-builder/ui': UI,
            '@react-awesome-query-builder/antd': ANTD,
            '@react-awesome-query-builder/mui': MUI,
            '@react-awesome-query-builder/material': MATERIAL,
            '@react-awesome-query-builder/bootstrap': BOOTSTRAP,
        },
        fallback: {
          fs: false,
          util: false
        }
    },
};
