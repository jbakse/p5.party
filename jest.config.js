/* global module */
const config = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageReporters: ["text", "json-summary"],

  transformIgnorePatterns: ["/node_modules/(?!(on-change)/)"],
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  testRegex: "((\\.|/*.)(test))\\.[jt]sx?$",
};
module.exports = config;
