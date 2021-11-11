const puppeteer = require("puppeteer");
if (puppeteer.executablePath().indexOf("/home/ukrbublik/") == 0) {
  // ignore for my local dev
} else {
  process.env.CHROME_BIN = puppeteer.executablePath();
}
process.env.TZ = "Etc/UTC";
process.env.BABEL_ENV = "test"; // Set the proper environment for babel

const isCI = !!process.env.CI;

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["webpack", "mocha", "chai", "es6-shim"],
    plugins: [
      "karma-mocha",
      "karma-chai",
      "karma-es6-shim",
      "karma-chrome-launcher",
      "karma-sourcemap-loader",
      "karma-webpack",
      "karma-mocha-reporter",
      "karma-junit-reporter",
      "karma-coverage",
    ],

    files: [
      {
        pattern: "karma.tests.js",
        watched: true,
        served: true,
        included: true,
      },
    ],
    exclude: [],
    preprocessors: {
      "karma.tests.js": ["webpack", "sourcemap"],
      "../modules/**/*": ["coverage"]
    },
    webpack: require("./webpack.config"),
    webpackMiddleware: {
      stats: "errors-only"
    },

    reporters: isCI ? ["progress", "junit", "coverage"] : ["progress", "coverage"],

    junitReporter: {
      outputDir: "../junit",
      outputFile: "test-results.xml",
      useBrowserName: false
    },

    coverageReporter: {
      dir: "../coverage",
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
    browsers: ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    },
    singleRun: true,
    concurrency: 1
  });
};
