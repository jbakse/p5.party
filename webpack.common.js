/* eslint-env node */

const webpack = require("webpack");
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

  plugins: [
    new CleanWebpackPlugin(),
    // use npm/buffer module to polyfill node buffer module
    // buffer is used by deepstream client
    // https://viglucci.io/how-to-polyfill-buffer-with-webpack-5
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  resolve: {
    fallback: {
      buffer: require.resolve("buffer/"),
    },
  },

  output: {
    filename: "p5.party.js",
    path: path.resolve(__dirname, "dist"),
  },
};
