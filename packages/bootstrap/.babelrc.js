const presetEnvOptions = {};
if (process.env.ESM === "1") {
  presetEnvOptions.modules = false;
}
const config = {
  "presets": [
    ["@babel/preset-env", presetEnvOptions],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  "plugins": [
    ["@babel/plugin-transform-class-properties", { "loose": true }],
    ["@babel/plugin-transform-private-methods", { "loose": true }],
    ["@babel/plugin-transform-runtime", { "loose": true }],
    ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
  ],
  "env": {
    "production": {
      "compact": true,
      "comments": false,
      "minified": true
    }
  }
};

module.exports = config;
