const puppeteer = require("puppeteer");
const path = require("path");
if (puppeteer.executablePath().indexOf("/home/ukrbublik/") == 0) {
  // ignore for my local dev
} else {
  process.env.CHROME_BIN = puppeteer.executablePath();
}
process.env.TZ = "Etc/UTC";
process.env.BABEL_ENV = "test"; // Set the proper environment for babel

const isCI = !!process.env.CI;
const isDebug = !!process.env.TEST_DEBUG;

module.exports = function(config) {
  config.set({
    frameworks: ["mocha", "chai", "webpack"],
    plugins: [
      "karma-mocha",
      "karma-chai",
      //"karma-es6-shim",
      "karma-chrome-launcher",
      "karma-sourcemap-loader",
      "karma-webpack",
      "karma-mocha-reporter",
      "karma-junit-reporter",
      "karma-coverage"
    ],

    files: [
      {
        pattern: "karma.tests.js",
        watched: true,
        served: true,
        included: true,
      }
    ],
    exclude: [],
    preprocessors: {
      "karma.tests.js": [ "webpack", "sourcemap" ]
    },
    webpack: require("./webpack.config"),
    webpackMiddleware: {
      stats: "errors-only"
    },

    reporters: isCI ? ["mocha", "junit", "coverage"] : isDebug ? ["progress"] : ["progress", "coverage"],

    junitReporter: {
      outputDir: "junit",
      outputFile: "test-results.xml",
      useBrowserName: false
    },

    coverageReporter: {
      dir: "coverage",
      reporters: [
        { type: "html", subdir: "html" },
        { type: "text-summary" },
        { type: "lcovonly", subdir: "lcov" }
      ],
      includeAllSources: true,
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: isDebug ? ["ChromeWithDebugging"] : ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeWithDebugging: {
        base: 'Chrome',
        flags: [
          "--no-sandbox", 
          "--remote-debugging-port=9333"
        ],
        debug: true,
      },
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: [
          "--no-sandbox",
          "--disable-setuid-sandbox"
        ],
      }
    },
    singleRun: true,
    concurrency: 1,
    // captureTimeout: 60000,
    browserDisconnectTimeout : isDebug ? 1000*60*10 : 1000*20,
    browserDisconnectTolerance : isDebug ? 1 : 0,
    browserNoActivityTimeout : isDebug ? 1000*60 : 1000*30,
  });
};
