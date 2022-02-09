/* global module */
const config = {
  testEnvironment: "jsdom",
  collectCoverage: true,
  moduleFileExtensions: ["js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(on-change)/)"],
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  testRegex: "((\\.|/*.)(test))\\.js?$",
};
module.exports = config;
