const webpack = require('webpack');
const path = require('path');
const os = require('os');

const CORE_MODULES = path.resolve(__dirname, "../core/modules");
const UI_MODULES = path.resolve(__dirname, "../ui/modules");
const ANTD_MODULES = path.resolve(__dirname, "../antd/modules");
const MUI_MODULES = path.resolve(__dirname, "../mui/modules");
const MATERIAL_MODULES = path.resolve(__dirname, "../material/modules");
const BOOTSTRAP_MODULES = path.resolve(__dirname, "../bootstrap/modules");
const FLUENT_MODULES = path.resolve(__dirname, "../fluent/modules");

const UI_CSS = path.resolve(__dirname, '../ui/styles/');
const ANTD_CSS = path.resolve(__dirname, '../antd/styles/');
const MUI_CSS = path.resolve(__dirname, '../mui/styles/');
const MATERIAL_CSS = path.resolve(__dirname, '../material/styles/');
const BOOTSTRAP_CSS = path.resolve(__dirname, '../bootstrap/styles/');
const FLUENT_CSS = path.resolve(__dirname, '../fluent/styles/');

const NODE_MODULES = path.resolve(__dirname, './node_modules/');

const TESTS = path.resolve(__dirname);

const isDebug = process.env.TEST_DEBUG === "1";
const isWatch = process.env.TEST_WATCH === "1";
const outputPath = path.join(os.tmpdir(), '_karma_webpack_') + Math.floor(Math.random() * 1000000);
const filterIndex = process.argv.findIndex(arg => arg.includes('--filter'));
let filterArgs = filterIndex === -1 ? [] : process.argv.slice(filterIndex+1);
if (filterArgs.length === 1) {
  filterArgs = filterArgs[0].split(" ").filter(a => !!a)
}
const hasFilterArgs = filterArgs?.length > 0;
const useCoverage = !isDebug && !isWatch; // && !hasFilterArgs

// 'source-map' is needed for adequate coverage data ('inline-source-map' is OK too)
// 'inline-source-map' is needed for debugging tests
// 'eval' only produces readable stacktraces (with correct source files, but incorrect lines)
// NOTE: Last rule is obsolete after disabling `optimization`, can try 'inline-source-map' for all cases
const devtool = useCoverage ? 'source-map' : isDebug ? 'inline-source-map' : 'eval';
console.log('karma-webpack devtool: ' + devtool);
console.log('karma-webpack output: ' + outputPath);

const processEnv = {
  NODE_ENV: JSON.stringify('development'),
  CI: JSON.stringify(process.env.CI),
  FILTER_ARGS: JSON.stringify(filterArgs),
  // default is 2*1000
  TEST_TIMEOUT: JSON.stringify(10*1000),
  // should be < browserNoActivityTimeout
  DEBUG_TEST_TIMEOUT: JSON.stringify(60*1000),
};

module.exports = {
  mode: "development",
  devtool,
  output: {
    path: outputPath,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': processEnv,
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
          CORE_MODULES,
          UI_MODULES,
          ANTD_MODULES,
          MUI_MODULES,
          MATERIAL_MODULES,
          BOOTSTRAP_MODULES,
          FLUENT_MODULES,
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
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.less', '.scss'],
    alias: {
      '@react-awesome-query-builder/ui/css': UI_CSS,
      '@react-awesome-query-builder/antd/css': ANTD_CSS,
      '@react-awesome-query-builder/mui/css': MUI_CSS,
      '@react-awesome-query-builder/material/css': MATERIAL_CSS,
      '@react-awesome-query-builder/bootstrap/css': BOOTSTRAP_CSS,
      '@react-awesome-query-builder/fluent/css': FLUENT_CSS,

      '@react-awesome-query-builder/core': CORE_MODULES,
      '@react-awesome-query-builder/ui': UI_MODULES,
      '@react-awesome-query-builder/antd': ANTD_MODULES,
      '@react-awesome-query-builder/mui': MUI_MODULES,
      '@react-awesome-query-builder/material': MATERIAL_MODULES,
      '@react-awesome-query-builder/bootstrap': BOOTSTRAP_MODULES,
      '@react-awesome-query-builder/fluent': FLUENT_MODULES,

      'react': path.resolve(NODE_MODULES, 'react'),
      'react-dom': path.resolve(NODE_MODULES, 'react-dom'),
    },
    fallback: {
      fs: false,
      util: false
    }
  },
  optimization: {
    // Required for correct stacktraces
    // https://github.com/codymikol/karma-webpack/issues/493#issuecomment-780411348
    splitChunks: false,
    runtimeChunk: false,
  },
};
