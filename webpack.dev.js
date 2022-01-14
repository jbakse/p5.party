/* eslint-env node */

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

// migration guide
// https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    devMiddleware: {
      publicPath: "/dist/",
      mimeTypes: { jsm: "text/javascript" },
    },
    static: {
      directory: "./public/",
      watch: true,
    },
  },
});
