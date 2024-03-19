/* global module */
const config = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom", // requires jest-environment-jsdom
  collectCoverage: true,
  coverageReporters: ["text", "json-summary"],

  transformIgnorePatterns: ["/node_modules/(?!(on-change)/)"],

  testRegex: "((\\.|/*.)(test))\\.[jt]sx?$",
};
module.exports = config;
