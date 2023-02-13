/* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* istanbul ignore file */

import * as log from "../src/log";

// p5 party configs

// ! to test with local backend, you need to run `npm run serve` first
export const HOST = "ws://127.0.0.1:6020";
export const DELAY = 200;

// export const HOST = "wss://demoserver.p5party.org";
// export const DELAY = 500;

export const errorSpy = //
  jest.spyOn(log, "error").mockImplementation((...args) => {
    //console.log(...args);
  });

export const warnSpy = //
  jest.spyOn(log, "warn").mockImplementation((...args) => {
    // console.log(...args);
  });

export const logSpy = //
  jest.spyOn(log, "log").mockImplementation((...args) => {
    // console.log(...args);
  });

beforeEach(() => {
  errorSpy.mockClear();
  warnSpy.mockClear();
  logSpy.mockClear();
});

afterEach(() => {
  expect(warnSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
});

export function millis(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
