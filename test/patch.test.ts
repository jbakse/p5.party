/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-function */
import { JSONObject } from "@deepstream/client/dist/src/constants";

import { patchInPlace } from "../src/patch";

import { errorSpy } from "./common";

describe("bad arguments", () => {
  test("old: {}, new: 1", () => {
    // cast arguments as unkonwn, JSONObject to force through BAD arguments
    const oldObject: unknown = {};
    const newObject: unknown = 1;

    patchInPlace(oldObject as JSONObject, newObject as JSONObject);
    expect(oldObject).toStrictEqual({});
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockClear();
  });

  test("old: 1, new: {}", () => {
    // cast arguments as unkonwn, JSONObject to force through BAD arguments
    const oldObject: unknown = 1;
    const newObject: unknown = {};

    patchInPlace(oldObject as JSONObject, newObject as JSONObject);
    expect(oldObject).toStrictEqual(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockClear();
  });
});

describe("unsuported data", () => {
  test("error on new unsupported data", () => {
    // cast arguments as unkonwn, JSONObject to force through BAD arguments
    const oldObject = {
      symbol: "old",
      function: "old",
      infinity: "old",
      nan: "old",
    };

    const newObject: unknown = {
      symbol: Symbol("hello"),
      function: () => {
        /* */
      },
      infinity: Infinity,
      nan: NaN,
    };

    patchInPlace(oldObject, newObject as JSONObject);
    expect(oldObject.symbol).toStrictEqual("old");
    expect(oldObject.function).toStrictEqual("old");
    expect(oldObject.infinity).toStrictEqual("old");
    expect(oldObject.nan).toStrictEqual("old");
    expect(errorSpy).toHaveBeenCalledTimes(4);
    errorSpy.mockClear();
  });

  test("overwrite old unsupported data", () => {
    // cast arguments as unkonwn, JSONObject to force through BAD arguments
    const oldObject: unknown = {
      symbol: Symbol("hello"),
      function: () => {},
      infinity: Infinity,
      nan: NaN,
    };

    const newObject: unknown = {
      symbol: "old",
      function: "old",
      infinity: "old",
      nan: "old",
    };

    patchInPlace(oldObject as JSONObject, newObject as JSONObject);
    expect(oldObject).toStrictEqual(newObject);
  });
});

describe("supported data", () => {
  test("old: {}, new: {}", () => {
    const oldObject = {};
    const newObject = {};
    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
    expect(oldObject).toStrictEqual({});
  });

  test("same values", () => {
    const oldObject = {
      null: null,
      boolean: true,
      number: 1,
      string: "hello",
      array: [1, 2, 3],
      object: { a: 0, b: 1, c: 2 },
    };

    const newObject = {
      null: null,
      boolean: true,
      number: 1,
      string: "hello",
      array: [1, 2, 3],
      object: { a: 0, b: 1, c: 2 },
    };

    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("new values of same type", () => {
    const oldObject = {
      null: null,
      boolean: true,
      number: 1,
      string: "hello",
      array: [1, 2, 3],
      object: { a: 0, b: 1, c: 2 },
    };

    const newObject = {
      null: {},
      boolean: false,
      number: 2,
      string: "goodbye",
      array: [4, 5, 6],
      object: { d: 0, e: 1, f: 2 },
    };

    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });
});

describe("arrays", () => {
  test("no change", () => {
    const oldObject = { a: [1, 2, 3, 4] };
    const newObject = { a: [1, 2, 3, 4] };
    const oldObject_a = oldObject.a;

    patchInPlace(oldObject, newObject);
    expect(oldObject_a).toBe(oldObject.a);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("change values", () => {
    const oldObject = { a: [1, 2, 3, 4] };
    const newObject = { a: [5, 6, 7, 8] };
    const oldObject_a = oldObject.a;

    patchInPlace(oldObject, newObject);
    expect(oldObject_a).toBe(oldObject.a);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("add items", () => {
    const oldObject = { a: [1, 2, 3, 4] };
    const newObject = { a: [1, 2, 3, 4, 5, 6] };
    const oldObject_a = oldObject.a;

    patchInPlace(oldObject, newObject);
    expect(oldObject_a).toBe(oldObject.a);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("remove items", () => {
    const oldObject = { a: [1, 2, 3, 4] };
    const newObject = { a: [1, 2] };
    const oldObject_a = oldObject.a;

    patchInPlace(oldObject, newObject);
    expect(oldObject_a).toBe(oldObject.a);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("remove items from start", () => {
    const oldObject = { a: [1, 2, 3, 4] };
    const newObject = { a: [3, 4] };
    const oldObject_a = oldObject.a;

    patchInPlace(oldObject, newObject);
    expect(oldObject_a).toBe(oldObject.a);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("remove all items", () => {
    const oldObject = { a: [1, 2, 3, 4] };
    const newObject = { a: [] };
    const oldObject_a = oldObject.a;

    patchInPlace(oldObject, newObject);
    expect(oldObject_a).toBe(oldObject.a);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("to other types", () => {
    const oldObject = {
      a: [1, 2, 3],
      b: [1, 2, 3],
      c: [1, 2, 3],
      d: [1, 2, 3],
    };

    const newObject = {
      a: null,
      b: 1,
      c: "hello",
      d: { a: 1, b: 2, c: 3 },
    };

    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("from other types", () => {
    const oldObject = {
      a: null,
      b: 1,
      c: "hello",
      d: { a: 1, b: 2, c: 3 },
    };
    const newObject = {
      a: [1, 2, 3],
      b: [1, 2, 3],
      c: [1, 2, 3],
      d: [1, 2, 3],
    };

    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });
});

describe("objects", () => {
  test("no change", () => {
    const oldObject = { o: { a: 1, b: 2, c: 3 } };
    const newObject = { o: { a: 1, b: 2, c: 3 } };
    const oldObject_o = oldObject.o;
    patchInPlace(oldObject, newObject);

    expect(oldObject_o).toBe(oldObject.o);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("change values", () => {
    const oldObject = { o: { a: 1, b: 2, c: 3 } };
    const newObject = { o: { a: 4, b: 5, c: 6 } };
    const oldObject_o = oldObject.o;
    patchInPlace(oldObject, newObject);

    expect(oldObject_o).toBe(oldObject.o);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("add properties", () => {
    const oldObject = { o: { a: 1, b: 2, c: 3 } };
    const newObject = { o: { a: 1, b: 2, c: 3, d: 4, e: 5 } };
    const oldObject_o = oldObject.o;
    patchInPlace(oldObject, newObject);

    expect(oldObject_o).toBe(oldObject.o);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("remove properties", () => {
    const oldObject = { o: { a: 1, b: 2, c: 3 } };
    const newObject = { o: { a: 1 } };
    const oldObject_o = oldObject.o;
    patchInPlace(oldObject, newObject);

    expect(oldObject_o).toBe(oldObject.o);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("remove sibling", () => {
    const oldObject = { a: [], o: { a: 1 } };
    const newObject = { o: { a: 1 } };
    const oldObject_o = oldObject.o;
    patchInPlace(oldObject, newObject);

    expect(oldObject_o).toBe(oldObject.o);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("empty out", () => {
    const oldObject = { o: { a: 1, b: 2, c: 3 } };
    const newObject = { o: {} };
    const oldObject_o = oldObject.o;
    patchInPlace(oldObject, newObject);

    expect(oldObject_o).toBe(oldObject.o);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("add property", () => {
    const oldObject = { a: 1 };
    const newObject = { a: 1, b: 2 };
    patchInPlace(oldObject, newObject);

    expect(oldObject).toStrictEqual(newObject);
  });

  test("remove property", () => {
    const oldObject = { a: 1, b: 2 };
    const newObject = { a: 1 };
    patchInPlace(oldObject, newObject);

    expect(oldObject).toStrictEqual(newObject);
  });

  test("no common property", () => {
    const oldObject = { a: 1 };
    const newObject = { b: 2 };
    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("to other types", () => {
    const oldObject = {
      a: { a: 1, b: 2, c: 3 },
      b: { a: 1, b: 2, c: 3 },
      c: { a: 1, b: 2, c: 3 },
      d: { a: 1, b: 2, c: 3 },
    };

    const newObject = {
      a: null,
      b: 1,
      c: "hello",
      d: [0, 1, 2],
    };

    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });

  test("from other types", () => {
    const oldObject = {
      a: null,
      b: 1,
      c: "hello",
      d: [0, 1, 2],
    };
    const newObject = {
      a: { a: 1, b: 2, c: 3 },
      b: { a: 1, b: 2, c: 3 },
      c: { a: 1, b: 2, c: 3 },
      d: { a: 1, b: 2, c: 3 },
    };

    patchInPlace(oldObject, newObject);
    expect(oldObject).toStrictEqual(newObject);
  });
});

//! this test is for a possible future feature that isn't yet supported
/*
describe("references", () => {
  test.skip("slice", () => {
    // you might expect that if you remove the first item from the array
    // that a reference to the second item, would now refer to the the item in the first position
    // but the merge doesn't know if the first item was removed
    // or if the last item was removed and the other two items were changed

    const oldObject = { a: [{ id: 1 }, { id: 2 }, { id: 3 }] };
    const newObject = { a: [{ id: 2 }, { id: 3 }] };
    // eslint-disable-next-line
    const oldObject_a_1 = oldObject.a[1];
    patchInPlace(oldObject, newObject);
    expect(oldObject_a_1).toBe(oldObject.a[0]);
    expect(oldObject).toStrictEqual(newObject);
  });
});
*/
