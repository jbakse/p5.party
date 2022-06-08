/* global test describe*/

import { createEmitter } from "./emitter";

describe("emitter", () => {
  test("on", (done) => {
    const e = createEmitter();
    e.on("test", () => {
      done();
    });
    e.emit("test");
  });

  test("once", (done) => {
    const e = createEmitter();
    e.once("test", () => {
      done();
    });
    e.emit("test");
  });

  test("no listener", () => {
    const e = createEmitter();
    e.emit("test");
  });
});
