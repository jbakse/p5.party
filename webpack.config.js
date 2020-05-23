/* eslint-env node */

const path = require("path");

module.exports = {
  entry: "./src/index_p5.js",
  mode: "development",
  devServer: {
    contentBase: "./",
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
