/* eslint-env node */

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/index_p5.js",

  devServer: {
    publicPath: "/dist/",
    contentBase: "./",
    watchContentBase: true,
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
  plugins: [new CleanWebpackPlugin()],
  output: {
    filename: "together.js",
    path: path.resolve(__dirname, "dist"),
  },
};
