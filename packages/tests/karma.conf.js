// Required for date/time tests
// Works only in ChromeHeadless, not Chrome
process.env.TZ = "Etc/UTC";
// Set the proper environment for babel
process.env.BABEL_ENV = "test";

const isCI = !!process.env.CI;
const isDebug = process.env.TEST_DEBUG === "1";
const isWatch = process.env.TEST_WATCH === "1";
const filterIndex = process.argv.findIndex(arg => arg.includes('--filter'));
let filterArgs = filterIndex === -1 ? [] : process.argv.slice(filterIndex+1);
if (filterArgs.length === 1) {
  filterArgs = filterArgs[0].split(" ").filter(a => !!a)
}
const hasFilterArgs = filterArgs?.length > 0;
const useCoverage = !isDebug && !isWatch; // && !hasFilterArgs

let reporters;
if (isCI) {
  reporters = ["mocha", "junit", "coverage"];
} else if (useCoverage) {
  reporters = ["progress", "coverage"];
} else {
  reporters = ["mocha"];
}

module.exports = function(config) {
  config.set({
    frameworks: ["mocha", "chai", "webpack"],
    plugins: [
      "karma-mocha",
      "karma-chai",
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

    reporters,

    mochaReporter: {
      showDiff: true
    },

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
    autoWatch: isWatch,
    browsers: isDebug ? ["ChromeWithDebugging"] : ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeWithDebugging: {
        base: 'Chrome',
        flags: [
          "--no-sandbox", 
          "--remote-debugging-port=9333",
          "--auto-open-devtools-for-tabs"
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
    singleRun: !isWatch,
    concurrency: 1,
    // captureTimeout: 60000,
    browserDisconnectTimeout : isDebug ? 1000*60*10 : 1000*20,
    browserDisconnectTolerance : isDebug ? 1 : 0,
    browserNoActivityTimeout : isDebug ? 1000*90 : 1000*30,
  });
};
