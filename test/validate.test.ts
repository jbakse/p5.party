/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-function */
// import { JSONObject } from "@deepstream/client/dist/src/constants";
// import { Room } from "../src/newRoom";

import { isJSONValue, isJSONObject, isEmpty } from "../src/validate";

import { warnSpy } from "./common";

describe("Validate — validates", () => {
  it("validates strings", () => {
    expect(isJSONValue("hello")).toBe(true);
  });

  it("validates numbers", () => {
    expect(isJSONValue(1)).toBe(true);
  });

  it("validates nulls", () => {
    expect(isJSONValue(null)).toBe(true);
  });

  it("validates empty array", () => {
    expect(isJSONValue([])).toBe(true);
  });

  it("validates number array", () => {
    expect(isJSONValue([1, 2, 3])).toBe(true);
  });

  it("validates mixed array", () => {
    expect(isJSONValue([1, 2, "c"])).toBe(true);
  });

  it("validates empty object", () => {
    expect(isJSONValue({})).toBe(true);
  });

  it("validates object with numbers", () => {
    expect(isJSONValue({ a: 1, b: 2 })).toBe(true);
  });

  it("validates object with mixed", () => {
    expect(isJSONValue({ a: 1, b: "c" })).toBe(true);
  });

  it("validates complex object", () => {
    expect(
      isJSONValue({ a: 1, b: { c: "c", d: [1, 2, 3], e: [1, "b", {}] } })
    ).toBe(true);
  });

  it("accepts a name", () => {
    expect(isJSONValue("hello", "name")).toBe(true);
  });
});

describe("Validate — rejects", () => {
  // it("rejects undefined + warns", () => {
  //   expect(isJSONValue(undefined)).toBe(false);
  //   expect(warnSpy).toHaveBeenCalledTimes(1);
  //   warnSpy.mockClear();
  // });

  // it("rejects undefined in object + warns", () => {
  //   expect(isJSONValue({ a: 1, b: undefined })).toBe(false);
  //   expect(warnSpy).toHaveBeenCalledTimes(1);
  //   warnSpy.mockClear();
  // });

  it("rejects functions + warns", () => {
    expect(isJSONValue((x: any) => x)).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });

  it("rejects symbols + warns", () => {
    expect(isJSONValue(Symbol())).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });
});

describe("isJsonObject", () => {
  it("approves json objects", () => {
    expect(isJSONObject({ a: 1, b: [1] })).toBe(true);
  });

  it("rejects non json objects and warns", () => {
    expect(isJSONObject({ a: () => {}, b: [1] })).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });

  it("rejects non object json values and warns", () => {
    expect(isJSONObject(1)).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockClear();
  });
});

describe("isEmpty", () => {
  it("approves empty objects", () => {
    expect(isEmpty({})).toBe(true);
  });

  it("approves empty arrays", () => {
    expect(isEmpty([])).toBe(true);
  });

  it("rejects non empty objects", () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it("rejects non empty arrays", () => {
    expect(isEmpty([1])).toBe(false);
  });

  it("rejects strings", () => {
    expect(isEmpty("test")).toBe(false);
  });
});
