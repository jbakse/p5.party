/* eslint-env node */

const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index_p5.js",
  devtool: "inline-source-map",
  devServer: {
    publicPath: "/dist/",
    contentBase: "./",
    watchContentBase: true,
    writeToDisk: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        },
      },
    ],
  },

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
