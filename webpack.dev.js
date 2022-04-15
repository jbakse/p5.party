/* eslint-env node */

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

// migration guide
// https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md

module.exports = merge(common, {
  mode: "development",
  target: "web",
  devtool: "inline-source-map",
  devServer: {
    open: true,
    devMiddleware: {
      publicPath: "/dist/",
      mimeTypes: { jsm: "text/javascript", css: "text/css" },
    },
    static: {
      directory: "./public",
      watch: true,
    },
  },
});
