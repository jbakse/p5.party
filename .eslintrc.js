/* eslint-env node */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "p5js"],

  overrides: [
    {
      files: ["*.ts", "*.tsx"], // Your TypeScript files extension
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
        "p5js",
      ],
      parserOptions: {
        project: ["./tsconfig.json"], // Specify it only for TypeScript files
      },
      rules: {
        "@typescript-eslint/non-nullable-type-assertion-style": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
      },
    },
  ],

  env: {
    browser: true,
    es6: true, // allows es6 globals
  },
  parserOptions: {
    ecmaVersion: 13, // allows es13 syntax
    sourceType: "module",
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  globals: {},
  rules: {},
};
