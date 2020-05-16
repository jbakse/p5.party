/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["eslint:recommended", "p5js"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 11,
    // sourceType: "module",
  },
  rules: {
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: false,
        argsIgnorePattern: "e",
      },
    ],
  },
};
