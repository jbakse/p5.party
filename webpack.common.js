/* eslint-env node */

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./src/index_p5.js",

  module: {
    rules: [
      {
        test: /\.css$/u,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/u,
        exclude: /node_modules/u,
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
    filename: "p5.party.js",
    path: path.resolve(__dirname, "dist"),
  },
};
